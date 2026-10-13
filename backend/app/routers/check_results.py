"""Check results router: history and uptime stats for a monitor."""

import uuid
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.check_result import CheckResult
from app.models.user import User
from app.services import check_service, monitor_service

router = APIRouter(tags=["check-results"])


# ── Response schemas ──────────────────────────────────────────────────────────


class CheckResultResponse(BaseModel):
    id: int
    checked_at: datetime
    status: str
    response_time_ms: int | None
    status_code: int | None
    error_message: str | None

    model_config = {"from_attributes": True}


class CheckHistoryResponse(BaseModel):
    results: list[CheckResultResponse]
    next_cursor: str | None  # ISO timestamp of last result for cursor pagination


class UptimeStatsResponse(BaseModel):
    monitor_id: uuid.UUID
    uptime_24h: float
    uptime_7d: float
    uptime_30d: float
    avg_response_time_ms: float | None
    total_checks_24h: int


# ── Endpoints ─────────────────────────────────────────────────────────────────


@router.get(
    "/monitors/{monitor_id}/checks",
    response_model=CheckHistoryResponse,
    summary="Paginated check result history for a monitor",
)
async def get_check_history(
    monitor_id: uuid.UUID,
    limit: int = Query(default=100, ge=1, le=500),
    before: datetime | None = Query(
        default=None, description="Cursor: return results before this ISO timestamp"
    ),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CheckHistoryResponse:
    monitor = await monitor_service.get_monitor_by_id(db, monitor_id)
    if monitor is None or monitor.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Monitor not found.")

    query = (
        select(CheckResult)
        .where(CheckResult.monitor_id == monitor_id)
        .order_by(CheckResult.checked_at.desc())
        .limit(limit + 1)
    )
    if before is not None:
        query = query.where(CheckResult.checked_at < before)

    result = await db.execute(query)
    rows = result.scalars().all()

    has_more = len(rows) > limit
    page = rows[:limit]
    next_cursor = page[-1].checked_at.isoformat() if has_more and page else None

    return CheckHistoryResponse(
        results=[CheckResultResponse.model_validate(r) for r in page],
        next_cursor=next_cursor,
    )


@router.get(
    "/monitors/{monitor_id}/uptime",
    response_model=UptimeStatsResponse,
    summary="Uptime statistics for a monitor",
)
async def get_uptime_stats(
    monitor_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UptimeStatsResponse:
    monitor = await monitor_service.get_monitor_by_id(db, monitor_id)
    if monitor is None or monitor.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Monitor not found.")

    uptime_24h = await check_service.compute_uptime(db, monitor_id, days=1)
    uptime_7d = await check_service.compute_uptime(db, monitor_id, days=7)
    uptime_30d = await check_service.compute_uptime(db, monitor_id, days=30)

    # Average response time over last 24h
    since_24h = datetime.now(UTC) - timedelta(hours=24)
    result = await db.execute(
        select(CheckResult).where(
            CheckResult.monitor_id == monitor_id,
            CheckResult.checked_at >= since_24h,
            CheckResult.response_time_ms.is_not(None),
        )
    )
    checks_24h = result.scalars().all()
    valid_rts = [r.response_time_ms for r in checks_24h if r.response_time_ms is not None]
    avg_rt = round(sum(valid_rts) / len(valid_rts), 1) if valid_rts else None

    return UptimeStatsResponse(
        monitor_id=monitor_id,
        uptime_24h=uptime_24h,
        uptime_7d=uptime_7d,
        uptime_30d=uptime_30d,
        avg_response_time_ms=avg_rt,
        total_checks_24h=len(checks_24h),
    )
