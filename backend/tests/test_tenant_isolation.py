"""
Multi-Tenant Isolation and Authorization Security Test Suite.

Verifies:
- User A cannot view, modify, or delete User B's monitors.
- User A cannot view, patch, update, resolve, or delete User B's incidents.
- User A cannot view, update, or delete User B's status pages.
- User A cannot view User B's monitor check history or uptime metrics.
- User A cannot attach a monitor to User B's private status page.
- Ownership checks are consistently enforced with 403 Forbidden or 404 Not Found (enumeration-safe).
"""

import uuid
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException

from app.models.incident import Incident
from app.models.monitor import Monitor
from app.models.status_page import StatusPage
from app.models.user import User
from app.routers.check_results import get_check_history, get_uptime_stats
from app.routers.incidents import (
    add_update,
    delete_incident,
    get_incident,
    patch_incident,
    resolve_incident,
)
from app.routers.monitors import (
    _require_ownership as require_monitor_ownership,
)
from app.routers.monitors import (
    delete_monitor,
    get_monitor,
    update_monitor,
)
from app.routers.status_pages import (
    _require_ownership as require_page_ownership,
)
from app.routers.status_pages import (
    delete_status_page,
    get_status_page,
    update_status_page,
)
from app.schemas.incident import IncidentPatch, IncidentUpdateCreate
from app.schemas.monitor import MonitorUpdate
from app.schemas.status_page import StatusPageUpdate
from app.services.monitor_service import _verify_status_page_ownership

# ── Helpers ───────────────────────────────────────────────────────────────────


def make_user(email: str = "user@test.dev") -> User:
    u = User()
    u.id = uuid.uuid4()
    u.email = email
    u.name = "Test User"
    u.is_active = True
    return u


def make_monitor(owner: User) -> Monitor:
    m = Monitor()
    m.id = uuid.uuid4()
    m.user_id = owner.id
    m.name = "User Service"
    m.url = "https://example.com"
    m.monitor_type = "http"
    m.interval_seconds = 60
    m.timeout_seconds = 10
    m.expected_status_code = 200
    m.is_active = True
    m.current_status = "up"
    m.status_page_id = None
    return m


def make_incident(owner: User, monitor: Monitor | None = None) -> Incident:
    inc = Incident()
    inc.id = uuid.uuid4()
    inc.user_id = owner.id
    inc.monitor_id = monitor.id if monitor else None
    inc.title = "Outage"
    inc.status = "investigating"
    inc.impact = "major"
    inc.status_page_id = None
    inc.resolved_at = None
    inc.updates = []
    return inc


def make_status_page(owner: User, slug: str = "test-page") -> StatusPage:
    p = StatusPage()
    p.id = uuid.uuid4()
    p.user_id = owner.id
    p.slug = slug
    p.title = "Status Page"
    p.description = "System status"
    p.is_public = True
    return p


# ── Direct Ownership Helper Tests ─────────────────────────────────────────────


def test_require_ownership_passes_for_owner() -> None:
    user = make_user()
    # Must not raise
    require_monitor_ownership(user.id, user)
    require_page_ownership(user.id, user)


def test_require_ownership_raises_forbidden_for_other_user() -> None:
    user_a = make_user("a@test.dev")
    user_b = make_user("b@test.dev")

    with pytest.raises(HTTPException) as exc:
        require_monitor_ownership(user_a.id, user_b)
    assert exc.value.status_code == 403

    with pytest.raises(HTTPException) as exc:
        require_page_ownership(user_a.id, user_b)
    assert exc.value.status_code == 403


# ── Monitor Route Isolation Tests ──────────────────────────────────────────────


@pytest.mark.asyncio
async def test_user_b_cannot_get_user_a_monitor() -> None:
    user_a = make_user("a@test.dev")
    user_b = make_user("b@test.dev")
    monitor_a = make_monitor(user_a)

    mock_db = AsyncMock()
    with patch("app.services.monitor_service.get_monitor_by_id", return_value=monitor_a):
        with pytest.raises(HTTPException) as exc:
            await get_monitor(monitor_a.id, current_user=user_b, db=mock_db)
        assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_user_b_cannot_update_user_a_monitor() -> None:
    user_a = make_user("a@test.dev")
    user_b = make_user("b@test.dev")
    monitor_a = make_monitor(user_a)

    mock_db = AsyncMock()
    with patch("app.services.monitor_service.get_monitor_by_id", return_value=monitor_a):
        with pytest.raises(HTTPException) as exc:
            await update_monitor(
                monitor_a.id,
                body=MonitorUpdate(name="Hijacked Name"),
                current_user=user_b,
                db=mock_db,
            )
        assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_user_b_cannot_delete_user_a_monitor() -> None:
    user_a = make_user("a@test.dev")
    user_b = make_user("b@test.dev")
    monitor_a = make_monitor(user_a)

    mock_db = AsyncMock()
    with patch("app.services.monitor_service.get_monitor_by_id", return_value=monitor_a):
        with pytest.raises(HTTPException) as exc:
            await delete_monitor(monitor_a.id, current_user=user_b, db=mock_db)
        assert exc.value.status_code == 403


# ── Status Page Route Isolation Tests ──────────────────────────────────────────


@pytest.mark.asyncio
async def test_user_b_cannot_get_user_a_status_page() -> None:
    user_a = make_user("a@test.dev")
    user_b = make_user("b@test.dev")
    page_a = make_status_page(user_a)

    mock_db = AsyncMock()
    with patch("app.services.status_page_service.get_status_page_by_id", return_value=page_a):
        with pytest.raises(HTTPException) as exc:
            await get_status_page(page_a.id, current_user=user_b, db=mock_db)
        assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_user_b_cannot_update_user_a_status_page() -> None:
    user_a = make_user("a@test.dev")
    user_b = make_user("b@test.dev")
    page_a = make_status_page(user_a)

    mock_db = AsyncMock()
    with patch("app.services.status_page_service.get_status_page_by_id", return_value=page_a):
        with pytest.raises(HTTPException) as exc:
            await update_status_page(
                page_a.id,
                body=StatusPageUpdate(title="Defaced"),
                current_user=user_b,
                db=mock_db,
            )
        assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_user_b_cannot_delete_user_a_status_page() -> None:
    user_a = make_user("a@test.dev")
    user_b = make_user("b@test.dev")
    page_a = make_status_page(user_a)

    mock_db = AsyncMock()
    with patch("app.services.status_page_service.get_status_page_by_id", return_value=page_a):
        with pytest.raises(HTTPException) as exc:
            await delete_status_page(page_a.id, current_user=user_b, db=mock_db)
        assert exc.value.status_code == 403


# ── Incident Route Isolation Tests ─────────────────────────────────────────────


@pytest.mark.asyncio
async def test_user_b_cannot_get_user_a_incident() -> None:
    user_a = make_user("a@test.dev")
    user_b = make_user("b@test.dev")
    incident_a = make_incident(user_a)

    mock_db = AsyncMock()
    with patch("app.services.incident_service.get_incident_by_id", return_value=incident_a):
        with pytest.raises(HTTPException) as exc:
            await get_incident(incident_a.id, current_user=user_b, db=mock_db)
        assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_user_b_cannot_patch_user_a_incident() -> None:
    user_a = make_user("a@test.dev")
    user_b = make_user("b@test.dev")
    incident_a = make_incident(user_a)

    mock_db = AsyncMock()
    with patch("app.services.incident_service.get_incident_by_id", return_value=incident_a):
        with pytest.raises(HTTPException) as exc:
            await patch_incident(
                incident_a.id,
                body=IncidentPatch(title="Fake Incident"),
                current_user=user_b,
                db=mock_db,
            )
        assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_user_b_cannot_add_update_to_user_a_incident() -> None:
    user_a = make_user("a@test.dev")
    user_b = make_user("b@test.dev")
    incident_a = make_incident(user_a)

    mock_db = AsyncMock()
    with patch("app.services.incident_service.get_incident_by_id", return_value=incident_a):
        with pytest.raises(HTTPException) as exc:
            await add_update(
                incident_a.id,
                body=IncidentUpdateCreate(message="Malicious Update", status="monitoring"),
                current_user=user_b,
                db=mock_db,
            )
        assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_user_b_cannot_resolve_user_a_incident() -> None:
    user_a = make_user("a@test.dev")
    user_b = make_user("b@test.dev")
    incident_a = make_incident(user_a)

    mock_db = AsyncMock()
    with patch("app.services.incident_service.get_incident_by_id", return_value=incident_a):
        with pytest.raises(HTTPException) as exc:
            await resolve_incident(incident_a.id, current_user=user_b, db=mock_db)
        assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_user_b_cannot_delete_user_a_incident() -> None:
    user_a = make_user("a@test.dev")
    user_b = make_user("b@test.dev")
    incident_a = make_incident(user_a)

    mock_db = AsyncMock()
    with patch("app.services.incident_service.get_incident_by_id", return_value=incident_a):
        with pytest.raises(HTTPException) as exc:
            await delete_incident(incident_a.id, current_user=user_b, db=mock_db)
        assert exc.value.status_code == 403


# ── Metrics & History Isolation Tests ──────────────────────────────────────────


@pytest.mark.asyncio
async def test_user_b_cannot_view_user_a_check_history() -> None:
    user_a = make_user("a@test.dev")
    user_b = make_user("b@test.dev")
    monitor_a = make_monitor(user_a)

    mock_db = AsyncMock()
    with patch("app.services.monitor_service.get_monitor_by_id", return_value=monitor_a):
        # Must return 404 to avoid leaking whether monitor_id exists
        with pytest.raises(HTTPException) as exc:
            await get_check_history(monitor_a.id, current_user=user_b, db=mock_db)
        assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_user_b_cannot_view_user_a_uptime_stats() -> None:
    user_a = make_user("a@test.dev")
    user_b = make_user("b@test.dev")
    monitor_a = make_monitor(user_a)

    mock_db = AsyncMock()
    with patch("app.services.monitor_service.get_monitor_by_id", return_value=monitor_a):
        with pytest.raises(HTTPException) as exc:
            await get_uptime_stats(monitor_a.id, current_user=user_b, db=mock_db)
        assert exc.value.status_code == 404


# ── Status Page Attachment Cross-Tenant Verification ──────────────────────────


@pytest.mark.asyncio
async def test_cannot_attach_monitor_to_other_users_status_page() -> None:
    user_a = make_user("a@test.dev")
    user_b = make_user("b@test.dev")
    page_b = make_status_page(user_b)

    mock_db = AsyncMock()
    with (
        patch("app.services.status_page_service.get_status_page_by_id", return_value=page_b),
        pytest.raises(ValueError, match="not found or access denied"),
    ):
        await _verify_status_page_ownership(mock_db, page_b.id, user_a.id)
