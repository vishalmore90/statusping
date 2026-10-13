"""
APScheduler job management.

Design:
- One in-process BackgroundScheduler (thread-based, asyncio-aware).
- Each active monitor gets an IntervalTrigger job keyed by str(monitor.id).
- On startup: all active monitors are loaded from the DB and scheduled.
- Monitor CRUD hooks: add_monitor_job / remove_monitor_job / reschedule_monitor_job.
- Daily retention job at 02:00 UTC.
"""

import asyncio
import logging
from collections.abc import Coroutine
from typing import Any

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models.monitor import Monitor

log = logging.getLogger(__name__)

# Module-level scheduler singleton
_scheduler = BackgroundScheduler(timezone="UTC")


# ── Internal helper ───────────────────────────────────────────────────────────


def _run_async(coro: Coroutine[Any, Any, Any]) -> None:
    """Run an async coroutine from a sync scheduler context."""
    asyncio.run(coro)


# ── Public API ────────────────────────────────────────────────────────────────


def add_monitor_job(monitor: Monitor) -> None:
    """Add (or replace) an interval job for a monitor."""
    from app.services.check_service import run_check

    job_id = str(monitor.id)
    if _scheduler.get_job(job_id):
        _scheduler.remove_job(job_id)

    _scheduler.add_job(
        _run_async,
        trigger=IntervalTrigger(seconds=monitor.interval_seconds),
        id=job_id,
        name=f"check:{monitor.name}",
        args=[run_check(str(monitor.id))],
        replace_existing=True,
        misfire_grace_time=30,
    )
    log.debug("Scheduled job for monitor %s (every %ds)", monitor.id, monitor.interval_seconds)


def remove_monitor_job(monitor_id: str) -> None:
    """Remove the scheduler job for a monitor (no-op if not present)."""
    job = _scheduler.get_job(monitor_id)
    if job:
        job.remove()
        log.debug("Removed job for monitor %s", monitor_id)


def reschedule_monitor_job(monitor: Monitor) -> None:
    """Update the trigger interval for an existing job, or add it if missing."""
    job_id = str(monitor.id)
    if not monitor.is_active:
        remove_monitor_job(job_id)
        return

    job = _scheduler.get_job(job_id)
    if job:
        job.reschedule(trigger=IntervalTrigger(seconds=monitor.interval_seconds))
        log.debug("Rescheduled job %s to every %ds", job_id, monitor.interval_seconds)
    else:
        add_monitor_job(monitor)


# ── Lifecycle ─────────────────────────────────────────────────────────────────


async def start_scheduler() -> None:
    """
    Load all active monitors from DB and start the scheduler.
    Called once from FastAPI lifespan on app startup.
    """
    from app.services.check_service import delete_old_check_results, run_check

    log.info("Starting APScheduler...")

    # Load active monitors and register jobs
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Monitor).where(Monitor.is_active == True)  # noqa: E712
        )
        monitors = result.scalars().all()

    for monitor in monitors:
        job_id = str(monitor.id)
        _scheduler.add_job(
            _run_async,
            trigger=IntervalTrigger(seconds=monitor.interval_seconds),
            id=job_id,
            name=f"check:{monitor.name}",
            args=[run_check(str(monitor.id))],
            replace_existing=True,
            misfire_grace_time=30,
        )

    # Daily retention job at 02:00 UTC
    _scheduler.add_job(
        _run_async,
        trigger=CronTrigger(hour=2, minute=0, timezone="UTC"),
        id="retention_job",
        name="Delete check_results older than 90 days",
        args=[delete_old_check_results()],
        replace_existing=True,
    )

    _scheduler.start()
    log.info("APScheduler started with %d monitor jobs", len(monitors))


async def stop_scheduler() -> None:
    """Gracefully shut down the scheduler."""
    if _scheduler.running:
        _scheduler.shutdown(wait=False)
        log.info("APScheduler stopped")
