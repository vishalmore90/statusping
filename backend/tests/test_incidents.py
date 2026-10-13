"""
Incident service unit tests.
All run locally — no DB or SMTP needed (mock DB session).
"""

import uuid
from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.incident_service import (
    auto_create_incident,
    auto_resolve_incident,
)


def _make_monitor(
    *,
    status_page_id: uuid.UUID | None = None,
    current_status: str = "down",
) -> MagicMock:
    m = MagicMock()
    m.id = uuid.uuid4()
    m.user_id = uuid.uuid4()
    m.name = "Test Monitor"
    m.url = "https://example.com"
    m.status_page_id = status_page_id
    m.current_status = current_status
    return m


def _make_incident(resolved: bool = False) -> MagicMock:
    inc = MagicMock()
    inc.id = uuid.uuid4()
    inc.resolved_at = datetime.now(UTC) if resolved else None
    return inc


# ── auto_create_incident ──────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_auto_create_incident_no_status_page() -> None:
    """Monitor without a status page → no incident created."""
    monitor = _make_monitor(status_page_id=None)
    db = AsyncMock()

    result = await auto_create_incident(db, monitor)
    assert result is None
    db.execute.assert_not_called()


@pytest.mark.asyncio
async def test_auto_create_incident_already_open() -> None:
    """Open incident already exists → no new incident created."""
    monitor = _make_monitor(status_page_id=uuid.uuid4())
    existing_incident = _make_incident(resolved=False)

    mock_execute = MagicMock()
    mock_execute.scalar_one_or_none.return_value = existing_incident
    db = AsyncMock()
    db.execute = AsyncMock(return_value=mock_execute)

    result = await auto_create_incident(db, monitor)
    assert result is None


@pytest.mark.asyncio
async def test_auto_create_incident_creates_new() -> None:
    """No open incident → a new incident is created."""
    monitor = _make_monitor(status_page_id=uuid.uuid4())

    # First execute (lookup) → no open incident
    mock_lookup = MagicMock()
    mock_lookup.scalar_one_or_none.return_value = None
    db = AsyncMock()
    db.execute = AsyncMock(return_value=mock_lookup)
    db.flush = AsyncMock()
    db.add = MagicMock()

    with patch(
        "app.services.incident_service.create_incident",
        new=AsyncMock(return_value=_make_incident()),
    ) as mock_create:
        result = await auto_create_incident(db, monitor)
        assert result is not None
        mock_create.assert_called_once()
        call_kwargs = mock_create.call_args.kwargs
        assert call_kwargs["user_id"] == monitor.user_id
        assert call_kwargs["status_page_id"] == monitor.status_page_id
        assert call_kwargs["monitor_id"] == monitor.id
        assert call_kwargs["status"] == "investigating"


# ── auto_resolve_incident ─────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_auto_resolve_no_status_page() -> None:
    """Monitor without a status page → resolve is no-op."""
    monitor = _make_monitor(status_page_id=None)
    db = AsyncMock()

    result = await auto_resolve_incident(db, monitor)
    assert result is None
    db.execute.assert_not_called()


@pytest.mark.asyncio
async def test_auto_resolve_no_open_incident() -> None:
    """No open incident → resolve returns None."""
    monitor = _make_monitor(status_page_id=uuid.uuid4())

    mock_execute = MagicMock()
    mock_execute.scalar_one_or_none.return_value = None
    db = AsyncMock()
    db.execute = AsyncMock(return_value=mock_execute)

    result = await auto_resolve_incident(db, monitor)
    assert result is None


@pytest.mark.asyncio
async def test_auto_resolve_resolves_open_incident() -> None:
    """Open incident exists → it is resolved."""
    monitor = _make_monitor(status_page_id=uuid.uuid4())
    open_incident = _make_incident(resolved=False)

    mock_execute = MagicMock()
    mock_execute.scalar_one_or_none.return_value = open_incident
    db = AsyncMock()
    db.execute = AsyncMock(return_value=mock_execute)

    with patch(
        "app.services.incident_service.resolve_incident",
        new=AsyncMock(return_value=_make_incident(resolved=True)),
    ) as mock_resolve:
        result = await auto_resolve_incident(db, monitor)
        assert result is not None
        mock_resolve.assert_called_once_with(db, open_incident)


# ── notification_service (no-op when SMTP disabled) ───────────────────────────


@pytest.mark.asyncio
async def test_send_downtime_alert_no_smtp() -> None:
    """With SMTP disabled, send_downtime_alert is a no-op."""
    from app.services.notification_service import send_downtime_alert

    monitor = _make_monitor()
    incident = _make_incident()
    incident.title = "Monitor Down"
    incident.started_at = datetime.now(UTC)

    # SMTP not configured → should complete without raising
    with patch("app.services.notification_service.settings") as mock_settings:
        mock_settings.smtp_enabled = False
        await send_downtime_alert(monitor, incident, "user@example.com")


@pytest.mark.asyncio
async def test_send_recovery_alert_no_smtp() -> None:
    """With SMTP disabled, send_recovery_alert is a no-op."""
    from app.services.notification_service import send_recovery_alert

    monitor = _make_monitor()
    incident = _make_incident(resolved=True)
    incident.title = "Monitor Recovered"
    incident.started_at = datetime.now(UTC)
    incident.resolved_at = datetime.now(UTC)

    with patch("app.services.notification_service.settings") as mock_settings:
        mock_settings.smtp_enabled = False
        await send_recovery_alert(monitor, incident, "user@example.com")
