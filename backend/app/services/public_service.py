"""
Public status page service.

Aggregates all data needed to render a public status page:
  - All monitors attached to the page
  - 90-day daily uptime bars (batched in a single DB query — no N+1)
  - Recent incidents (open + resolved in last 14 days)
  - overall_status computed from current monitor statuses

Performance notes:
  - check_results fetched in a single query for all monitors at once
  - Python-side grouping avoids multiple round-trips
  - Designed to be cached at the HTTP layer (Cache-Control headers on the route)
"""

from collections import defaultdict
from datetime import UTC, date, datetime, timedelta

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.check_result import CheckResult
from app.models.incident import Incident
from app.models.monitor import Monitor
from app.models.status_page import StatusPage
from app.schemas.public import (
    DailyUptime,
    PublicIncident,
    PublicIncidentUpdate,
    PublicMonitor,
    PublicStatusPage,
)

# ── Overall status computation ────────────────────────────────────────────────


def _compute_overall_status(monitors: list[Monitor]) -> str:
    """
    Derive the page-level status banner from individual monitor statuses.

    Logic:
      - No monitors → operational
      - All up → operational
      - Any down + uptime > 50% → partial_outage
      - Any down + uptime <= 50% → major_outage
      - All up but avg response time hint → degraded_performance (future hook)
    """
    if not monitors:
        return "operational"

    down_count = sum(1 for m in monitors if m.current_status == "down")
    if down_count == 0:
        return "operational"
    ratio = down_count / len(monitors)
    if ratio < 0.5:
        return "partial_outage"
    return "major_outage"


# ── Daily uptime bar computation ──────────────────────────────────────────────


def _build_daily_bars(
    results: list[CheckResult],
    monitor_id: object,  # uuid.UUID
    days: int = 90,
) -> list[DailyUptime]:
    """
    Build a list of 90 daily uptime entries from raw check results.
    Days with no checks are reported as 100% (optimistic default).
    """
    # Group by calendar date (UTC)
    by_date: dict[date, list[str]] = defaultdict(list)
    for r in results:
        if r.monitor_id == monitor_id:
            day = r.checked_at.date() if r.checked_at.tzinfo is None else r.checked_at.astimezone(UTC).date()
            by_date[day].append(r.status)

    today = datetime.now(UTC).date()
    bars: list[DailyUptime] = []
    for offset in range(days - 1, -1, -1):  # oldest → newest
        d = today - timedelta(days=offset)
        statuses = by_date.get(d, [])
        if not statuses:
            pct = 100.0
        else:
            pct = round(sum(1 for s in statuses if s == "up") / len(statuses) * 100, 2)
        bars.append(DailyUptime(date=d, uptime_percentage=pct))
    return bars


def _compute_90d_uptime(results: list[CheckResult], monitor_id: object) -> float:
    """Overall 90-day uptime % from the same result set."""
    relevant = [r for r in results if r.monitor_id == monitor_id]
    if not relevant:
        return 100.0
    up = sum(1 for r in relevant if r.status == "up")
    return round(up / len(relevant) * 100, 2)


def _compute_avg_response_time(results: list[CheckResult], monitor_id: object) -> float | None:
    times = [
        r.response_time_ms
        for r in results
        if r.monitor_id == monitor_id and r.response_time_ms is not None
    ]
    if not times:
        return None
    return round(sum(times) / len(times), 1)


# ── Main aggregation ──────────────────────────────────────────────────────────


async def get_public_status_page(
    db: AsyncSession, slug: str
) -> PublicStatusPage | None:
    """
    Build the full public status page response.
    Returns None if the slug doesn't exist or the page is not public.
    """
    # 1. Load status page
    page_result = await db.execute(
        select(StatusPage).where(
            and_(StatusPage.slug == slug, StatusPage.is_public == True)  # noqa: E712
        )
    )
    page = page_result.scalar_one_or_none()
    if page is None:
        return None

    # 2. Load all monitors for this status page
    monitor_result = await db.execute(
        select(Monitor)
        .where(and_(Monitor.status_page_id == page.id, Monitor.is_active == True))  # noqa: E712
        .order_by(Monitor.created_at)
    )
    monitors = list(monitor_result.scalars().all())
    monitor_ids = [m.id for m in monitors]

    # 3. Load last 90 days of check results for ALL monitors in one query
    since_90d = datetime.now(UTC) - timedelta(days=90)
    checks_result = await db.execute(
        select(CheckResult).where(
            and_(
                CheckResult.monitor_id.in_(monitor_ids),
                CheckResult.checked_at >= since_90d,
            )
        )
    ) if monitor_ids else None
    all_checks: list[CheckResult] = (
        list(checks_result.scalars().all()) if checks_result else []
    )

    # 4. Build public monitor list
    public_monitors: list[PublicMonitor] = []
    for monitor in monitors:
        public_monitors.append(
            PublicMonitor(
                id=monitor.id,
                name=monitor.name,
                current_status=monitor.current_status,
                uptime_percentage_90d=_compute_90d_uptime(all_checks, monitor.id),
                avg_response_time_ms=_compute_avg_response_time(all_checks, monitor.id),
                status_history_90d=_build_daily_bars(all_checks, monitor.id),
            )
        )

    # 5. Load incidents: open + resolved in last 14 days
    since_14d = datetime.now(UTC) - timedelta(days=14)
    inc_result = await db.execute(
        select(Incident)
        .where(
            and_(
                Incident.status_page_id == page.id,
                (Incident.resolved_at.is_(None))
                | (Incident.resolved_at >= since_14d),
            )
        )
        .options(selectinload(Incident.updates))
        .order_by(Incident.started_at.desc())
        .limit(20)
    )
    incidents = list(inc_result.scalars().all())

    public_incidents: list[PublicIncident] = [
        PublicIncident(
            id=inc.id,
            title=inc.title,
            status=inc.status,
            impact=inc.impact,
            started_at=inc.started_at,
            resolved_at=inc.resolved_at,
            updates=[
                PublicIncidentUpdate(
                    message=u.message,
                    status=u.status,
                    created_at=u.created_at,
                )
                for u in sorted(inc.updates, key=lambda u: u.created_at, reverse=True)
            ],
        )
        for inc in incidents
    ]

    return PublicStatusPage(
        slug=page.slug,
        title=page.title,
        description=page.description,
        overall_status=_compute_overall_status(monitors),
        monitors=public_monitors,
        incidents=public_incidents,
        last_updated=datetime.now(UTC),
    )
