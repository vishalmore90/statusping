"""
Health check service: performs HTTP/TCP checks and records results.

Each check job creates its own DB session (runs outside FastAPI request context).
Status transitions trigger notification hooks (stubbed → Phase 5).
"""

import asyncio
import time
import urllib.parse
import uuid
from datetime import UTC, datetime, timedelta

import httpx
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import AsyncSessionLocal
from app.models.check_result import CheckResult
from app.models.monitor import Monitor
from app.utils.security import validate_http_url, validate_tcp_target

# ── Core check execution ──────────────────────────────────────────────────────


async def _perform_http_check(
    url: str,
    timeout_seconds: int,
    expected_status_code: int | None,
    enforce_dns: bool | None = None,
) -> tuple[str, int | None, int | None, str | None]:
    """
    Perform an HTTP GET check with SSRF protection and safe redirect chain validation.

    Returns:
        (status, response_time_ms, actual_status_code, error_message)
    """
    start = time.monotonic()
    should_resolve = enforce_dns if enforce_dns is not None else (settings.app_env != "test")

    try:
        validate_http_url(url, resolve_dns=should_resolve)
    except ValueError as exc:
        elapsed_ms = int((time.monotonic() - start) * 1000)
        return "down", elapsed_ms, None, f"Destination security check failed: {exc}"

    current_url = url
    max_redirects = 5
    redirect_count = 0

    try:
        async with httpx.AsyncClient(follow_redirects=False) as client:
            while True:
                response = await client.get(current_url, timeout=float(timeout_seconds))

                is_redirect = (
                    response.status_code in (301, 302, 303, 307, 308)
                    and "Location" in response.headers
                )
                if is_redirect:
                    redirect_count += 1
                    if redirect_count > max_redirects:
                        elapsed_ms = int((time.monotonic() - start) * 1000)
                        return (
                            "down",
                            elapsed_ms,
                            response.status_code,
                            "Too many redirects (exceeded limit of 5)",
                        )

                    location = response.headers["Location"]
                    next_url = urllib.parse.urljoin(current_url, location)

                    # Validate each redirect destination against SSRF policy before following
                    try:
                        validate_http_url(next_url, resolve_dns=should_resolve)
                    except ValueError as exc:
                        elapsed_ms = int((time.monotonic() - start) * 1000)
                        return (
                            "down",
                            elapsed_ms,
                            response.status_code,
                            f"Redirect to prohibited destination blocked: {exc}",
                        )

                    current_url = next_url
                else:
                    break

        elapsed_ms = int((time.monotonic() - start) * 1000)
        code = response.status_code
        expected = expected_status_code or 200
        check_status = "up" if code == expected else "down"
        return check_status, elapsed_ms, code, None
    except httpx.TimeoutException:
        elapsed_ms = int((time.monotonic() - start) * 1000)
        return "down", elapsed_ms, None, "Connection timed out"
    except httpx.RequestError as exc:
        elapsed_ms = int((time.monotonic() - start) * 1000)
        return "down", elapsed_ms, None, f"Request error: {type(exc).__name__}"
    except Exception as exc:  # noqa: BLE001
        elapsed_ms = int((time.monotonic() - start) * 1000)
        return "down", elapsed_ms, None, f"Check error: {exc}"


async def _perform_tcp_check(
    target: str,
    timeout_seconds: int,
    enforce_dns: bool | None = None,
) -> tuple[str, int | None, int | None, str | None]:
    """
    Perform a TCP socket connection check to host:port with SSRF protection.

    Returns:
        (status, response_time_ms, actual_status_code, error_message)
    """
    start = time.monotonic()
    should_resolve = enforce_dns if enforce_dns is not None else (settings.app_env != "test")

    try:
        host, port = validate_tcp_target(target, resolve_dns=should_resolve)
    except ValueError as exc:
        elapsed_ms = int((time.monotonic() - start) * 1000)
        return "down", elapsed_ms, None, f"Destination security check failed: {exc}"

    try:
        _, writer = await asyncio.wait_for(
            asyncio.open_connection(host, port),
            timeout=float(timeout_seconds),
        )
        writer.close()
        await writer.wait_closed()
        elapsed_ms = int((time.monotonic() - start) * 1000)
        return "up", elapsed_ms, None, None
    except TimeoutError:
        elapsed_ms = int((time.monotonic() - start) * 1000)
        return "down", elapsed_ms, None, "Connection timed out"
    except Exception as exc:
        elapsed_ms = int((time.monotonic() - start) * 1000)
        return "down", elapsed_ms, None, f"TCP connection error: {exc}"


async def _record_result(
    db: AsyncSession,
    monitor: Monitor,
    status: str,
    response_time_ms: int | None,
    status_code: int | None,
    error_message: str | None,
) -> tuple[CheckResult, str]:
    """Insert a CheckResult row and update monitor.current_status."""
    result = CheckResult(
        monitor_id=monitor.id,
        status=status,
        response_time_ms=response_time_ms,
        status_code=status_code,
        error_message=error_message,
    )
    db.add(result)

    previous_status = monitor.current_status
    monitor.current_status = status
    monitor.last_checked_at = datetime.now(UTC)
    db.add(monitor)

    await db.flush()
    return result, previous_status


async def run_check(monitor_id: str) -> None:
    """
    APScheduler job entry point.
    Creates its own DB session since it runs outside FastAPI request context.
    """
    async with AsyncSessionLocal() as db:
        try:
            result_obj = await db.execute(
                select(Monitor).where(Monitor.id == uuid.UUID(monitor_id))
            )
            monitor = result_obj.scalar_one_or_none()
            if monitor is None or not monitor.is_active:
                return

            # Perform the check
            if monitor.monitor_type == "http":
                status, response_time_ms, status_code, error_message = await _perform_http_check(
                    monitor.url, monitor.timeout_seconds, monitor.expected_status_code
                )
            else:
                status, response_time_ms, status_code, error_message = await _perform_tcp_check(
                    monitor.url, monitor.timeout_seconds
                )

            check_result, previous_status = await _record_result(
                db, monitor, status, response_time_ms, status_code, error_message
            )

            await db.commit()

            # Status transition → trigger incident management + notifications
            if previous_status != status:
                from sqlalchemy import select as sa_select

                from app.models.user import User as UserModel
                from app.services import incident_service, notification_service

                # Fetch owner email for notifications
                user_result = await db.execute(
                    sa_select(UserModel).where(UserModel.id == monitor.user_id)
                )
                owner = user_result.scalar_one_or_none()
                user_email = owner.email if owner else ""

                if status == "down":
                    incident = await incident_service.auto_create_incident(db, monitor)
                    await db.commit()  # commit incident before sending email
                    if incident and user_email:
                        await notification_service.send_downtime_alert(
                            monitor, incident, user_email
                        )
                elif status == "up":
                    incident = await incident_service.auto_resolve_incident(db, monitor)
                    await db.commit()
                    if incident and user_email:
                        await notification_service.send_recovery_alert(
                            monitor, incident, user_email
                        )

        except Exception:  # noqa: BLE001
            await db.rollback()
            raise


# ── Retention job ─────────────────────────────────────────────────────────────


async def delete_old_check_results() -> None:
    """
    Daily retention job: delete check_results older than 90 days.
    Called by APScheduler at 02:00 UTC.
    """
    cutoff = datetime.now(UTC) - timedelta(days=90)
    async with AsyncSessionLocal() as db:
        await db.execute(delete(CheckResult).where(CheckResult.checked_at < cutoff))
        await db.commit()


# ── Uptime computation ────────────────────────────────────────────────────────


async def compute_uptime(
    db: AsyncSession,
    monitor_id: uuid.UUID,
    days: int,
) -> float:
    """Return uptime percentage for the last N days. Returns 100.0 if no checks."""
    since = datetime.now(UTC) - timedelta(days=days)
    result = await db.execute(
        select(CheckResult).where(
            CheckResult.monitor_id == monitor_id,
            CheckResult.checked_at >= since,
        )
    )
    results = result.scalars().all()
    if not results:
        return 100.0
    up_count = sum(1 for r in results if r.status == "up")
    return round(up_count / len(results) * 100, 2)
