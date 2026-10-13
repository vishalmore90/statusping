"""
Incident service: CRUD, auto-creation with deduplication, and resolution.

Auto-incident deduplication:
  Before creating an incident, we check if there is already an unresolved
  incident for the same monitor. If yes, we add an update instead of
  opening a duplicate incident.
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.incident import Incident
from app.models.incident_update import IncidentUpdate
from app.models.monitor import Monitor
from app.models.status_page import StatusPage

# ── Lookup helpers ────────────────────────────────────────────────────────────


async def get_incident_by_id(
    db: AsyncSession, incident_id: uuid.UUID, *, load_updates: bool = True
) -> Incident | None:
    q = select(Incident).where(Incident.id == incident_id)
    if load_updates:
        q = q.options(selectinload(Incident.updates))
    result = await db.execute(q)
    return result.scalar_one_or_none()


async def get_user_incidents(
    db: AsyncSession,
    user_id: uuid.UUID,
    *,
    status_page_id: uuid.UUID | None = None,
    resolved: bool | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[Incident]:
    q = (
        select(Incident)
        .where(Incident.user_id == user_id)
        .options(selectinload(Incident.updates))
        .order_by(Incident.started_at.desc())
        .limit(limit)
        .offset(offset)
    )
    if status_page_id is not None:
        q = q.where(Incident.status_page_id == status_page_id)
    if resolved is True:
        q = q.where(Incident.resolved_at.is_not(None))
    elif resolved is False:
        q = q.where(Incident.resolved_at.is_(None))
    result = await db.execute(q)
    return list(result.scalars().all())


async def _get_open_incident_for_monitor(
    db: AsyncSession,
    monitor_id: uuid.UUID,
) -> Incident | None:
    """Find an unresolved incident that was auto-created for this monitor."""
    result = await db.execute(
        select(Incident).where(
            and_(
                Incident.monitor_id == monitor_id,
                Incident.resolved_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


# ── Mutation helpers ──────────────────────────────────────────────────────────


async def create_incident(
    db: AsyncSession,
    user_id: uuid.UUID,
    title: str,
    status: str = "investigating",
    impact: str = "minor",
    status_page_id: uuid.UUID | None = None,
    monitor_id: uuid.UUID | None = None,
    initial_message: str | None = None,
) -> Incident:
    if status_page_id is None:
        page_res = await db.execute(
            select(StatusPage.id).where(StatusPage.user_id == user_id).limit(1)
        )
        status_page_id = page_res.scalar_one_or_none()

    incident = Incident(
        user_id=user_id,
        title=title,
        status=status,
        impact=impact,
        status_page_id=status_page_id,
        monitor_id=monitor_id,
    )
    db.add(incident)
    await db.flush()  # obtain incident.id

    # Always add an initial update
    first_update = IncidentUpdate(
        incident_id=incident.id,
        message=initial_message or f"Incident opened: {title}",
        status=status,
    )
    db.add(first_update)
    await db.flush()
    incident.updates = [first_update]
    return incident


async def add_incident_update(
    db: AsyncSession,
    incident: Incident,
    message: str,
    status: str,
) -> IncidentUpdate:
    update = IncidentUpdate(
        incident_id=incident.id,
        message=message,
        status=status,
    )
    incident.status = status
    incident.updated_at = datetime.now(UTC)
    db.add(update)
    db.add(incident)
    await db.flush()
    return update


async def resolve_incident(db: AsyncSession, incident: Incident) -> Incident:
    """Mark incident as resolved and add a resolution update."""
    now = datetime.now(UTC)
    incident.status = "resolved"
    incident.resolved_at = now
    incident.updated_at = now
    db.add(incident)

    resolution = IncidentUpdate(
        incident_id=incident.id,
        message="This incident has been resolved.",
        status="resolved",
    )
    db.add(resolution)
    await db.flush()
    if "updates" in incident.__dict__ and isinstance(incident.updates, list):
        incident.updates.insert(0, resolution)
    else:
        incident.updates = [resolution]
    return incident


async def update_incident(
    db: AsyncSession,
    incident: Incident,
    title: str | None = None,
    status: str | None = None,
    impact: str | None = None,
) -> Incident:
    if title is not None:
        incident.title = title
    if status is not None:
        incident.status = status
    if impact is not None:
        incident.impact = impact
    incident.updated_at = datetime.now(UTC)
    db.add(incident)
    await db.flush()
    return incident


async def delete_incident(db: AsyncSession, incident: Incident) -> None:
    await db.delete(incident)
    await db.flush()


# ── Auto-incident (called from check_service) ─────────────────────────────────


async def auto_create_incident(db: AsyncSession, monitor: Monitor) -> Incident | None:
    """
    Open an incident when a monitor goes down.
    Skipped if:
    - The monitor is not attached to a status page
    - An unresolved incident for this monitor already exists
    """
    if monitor.status_page_id is None:
        return None

    existing = await _get_open_incident_for_monitor(db, monitor.id)
    if existing:
        return None  # already tracking this outage

    return await create_incident(
        db,
        user_id=monitor.user_id,
        title=f"{monitor.name} is down",
        status="investigating",
        impact="minor",
        status_page_id=monitor.status_page_id,
        monitor_id=monitor.id,
        initial_message=(
            f"We have detected that {monitor.name} is unreachable. We are investigating the issue."
        ),
    )


async def auto_resolve_incident(db: AsyncSession, monitor: Monitor) -> Incident | None:
    """
    Resolve the open incident when a monitor recovers.
    Returns the resolved incident or None if nothing was open.
    """
    if monitor.status_page_id is None:
        return None

    incident = await _get_open_incident_for_monitor(db, monitor.id)
    if incident is None:
        return None

    return await resolve_incident(db, incident)
