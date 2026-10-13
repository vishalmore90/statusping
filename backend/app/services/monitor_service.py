"""
Monitor service: CRUD + ownership enforcement.
Scheduler integration stubs are called here; actual job management in Phase 4.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.monitor import Monitor
from app.services import status_page_service


async def get_monitor_by_id(
    db: AsyncSession, monitor_id: uuid.UUID
) -> Monitor | None:
    result = await db.execute(select(Monitor).where(Monitor.id == monitor_id))
    return result.scalar_one_or_none()


async def get_user_monitors(
    db: AsyncSession,
    user_id: uuid.UUID,
    status_page_id: uuid.UUID | None = None,
    is_active: bool | None = None,
) -> list[Monitor]:
    query = select(Monitor).where(Monitor.user_id == user_id)
    if status_page_id is not None:
        query = query.where(Monitor.status_page_id == status_page_id)
    if is_active is not None:
        query = query.where(Monitor.is_active == is_active)
    query = query.order_by(Monitor.created_at)
    result = await db.execute(query)
    return list(result.scalars().all())


async def _verify_status_page_ownership(
    db: AsyncSession,
    status_page_id: uuid.UUID,
    user_id: uuid.UUID,
) -> None:
    """Raise ValueError if the status page doesn't exist or isn't owned by user."""
    page = await status_page_service.get_status_page_by_id(db, status_page_id)
    if page is None or page.user_id != user_id:
        raise ValueError("Status page not found or access denied.")


async def create_monitor(
    db: AsyncSession,
    user_id: uuid.UUID,
    name: str,
    url: str,
    monitor_type: str = "http",
    interval_seconds: int = 60,
    timeout_seconds: int = 10,
    expected_status_code: int | None = 200,
    status_page_id: uuid.UUID | None = None,
) -> Monitor:
    if status_page_id is not None:
        await _verify_status_page_ownership(db, status_page_id, user_id)

    monitor = Monitor(
        user_id=user_id,
        name=name,
        url=url,
        monitor_type=monitor_type,
        interval_seconds=interval_seconds,
        timeout_seconds=timeout_seconds,
        expected_status_code=expected_status_code,
        status_page_id=status_page_id,
        current_status="unknown",
    )
    db.add(monitor)
    await db.flush()

    from app.scheduler.jobs import add_monitor_job
    add_monitor_job(monitor)
    return monitor


async def update_monitor(
    db: AsyncSession,
    monitor: Monitor,
    user_id: uuid.UUID,
    name: str | None = None,
    url: str | None = None,
    monitor_type: str | None = None,
    interval_seconds: int | None = None,
    timeout_seconds: int | None = None,
    expected_status_code: int | None = None,
    is_active: bool | None = None,
    status_page_id: uuid.UUID | None = None,
) -> Monitor:
    if status_page_id is not None:
        await _verify_status_page_ownership(db, status_page_id, user_id)

    if name is not None:
        monitor.name = name
    if url is not None:
        monitor.url = url
    if monitor_type is not None:
        monitor.monitor_type = monitor_type
    if interval_seconds is not None:
        monitor.interval_seconds = interval_seconds
    if timeout_seconds is not None:
        monitor.timeout_seconds = timeout_seconds
    if expected_status_code is not None:
        monitor.expected_status_code = expected_status_code
    if is_active is not None:
        monitor.is_active = is_active
    if status_page_id is not None:
        monitor.status_page_id = status_page_id

    db.add(monitor)
    await db.flush()

    from app.scheduler.jobs import reschedule_monitor_job
    reschedule_monitor_job(monitor)
    return monitor


async def delete_monitor(db: AsyncSession, monitor: Monitor) -> None:
    from app.scheduler.jobs import remove_monitor_job
    remove_monitor_job(str(monitor.id))
    await db.delete(monitor)
    await db.flush()
