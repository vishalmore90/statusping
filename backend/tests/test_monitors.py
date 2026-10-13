"""
Monitor and Status Page endpoint tests.
DB tests skip automatically when PostgreSQL is not reachable.
"""

import pytest
from httpx import AsyncClient

from tests.conftest import requires_db

# ── URLs ──────────────────────────────────────────────────────────────────────
REGISTER_URL = "/api/v1/auth/register"
LOGIN_URL = "/api/v1/auth/login"
STATUS_PAGES_URL = "/api/v1/status-pages"
MONITORS_URL = "/api/v1/monitors"

# ── Helpers ───────────────────────────────────────────────────────────────────

USER_A = {"email": "usera@example.com", "password": "password123", "name": "User A"}
USER_B = {"email": "userb@example.com", "password": "password123", "name": "User B"}

VALID_MONITOR = {
    "name": "My API",
    "url": "https://api.example.com/health",
    "monitor_type": "http",
    "interval_seconds": 60,
    "timeout_seconds": 10,
    "expected_status_code": 200,
}


async def _register_and_login(client: AsyncClient, user: dict) -> str:
    """Register a user and return their access token."""
    await client.post(REGISTER_URL, json=user)
    resp = await client.post(
        LOGIN_URL, json={"email": user["email"], "password": user["password"]}
    )
    return resp.json()["access_token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ── Status Page Tests ─────────────────────────────────────────────────────────


@requires_db
@pytest.mark.asyncio
async def test_create_status_page(db_client: AsyncClient) -> None:
    token = await _register_and_login(db_client, USER_A)
    resp = await db_client.post(
        STATUS_PAGES_URL,
        json={"slug": "my-app", "title": "My App Status"},
        headers=_auth(token),
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["slug"] == "my-app"
    assert data["title"] == "My App Status"
    assert data["is_public"] is True


@requires_db
@pytest.mark.asyncio
async def test_create_status_page_duplicate_slug(db_client: AsyncClient) -> None:
    token_a = await _register_and_login(db_client, USER_A)
    token_b = await _register_and_login(db_client, USER_B)
    payload = {"slug": "shared-slug", "title": "Page"}
    await db_client.post(STATUS_PAGES_URL, json=payload, headers=_auth(token_a))
    # User B tries to claim the same slug
    resp = await db_client.post(STATUS_PAGES_URL, json=payload, headers=_auth(token_b))
    assert resp.status_code == 409


@requires_db
@pytest.mark.asyncio
async def test_create_second_status_page_blocked(db_client: AsyncClient) -> None:
    """MVP: only 1 status page per user."""
    token = await _register_and_login(db_client, USER_A)
    await db_client.post(
        STATUS_PAGES_URL, json={"slug": "first", "title": "First"}, headers=_auth(token)
    )
    resp = await db_client.post(
        STATUS_PAGES_URL, json={"slug": "second", "title": "Second"}, headers=_auth(token)
    )
    assert resp.status_code == 409


@requires_db
@pytest.mark.asyncio
async def test_invalid_slug_format(db_client: AsyncClient) -> None:
    token = await _register_and_login(db_client, USER_A)
    resp = await db_client.post(
        STATUS_PAGES_URL,
        json={"slug": "-bad-slug-", "title": "Bad"},
        headers=_auth(token),
    )
    assert resp.status_code == 422


# ── Monitor Tests ─────────────────────────────────────────────────────────────


@requires_db
@pytest.mark.asyncio
async def test_create_monitor_success(db_client: AsyncClient) -> None:
    token = await _register_and_login(db_client, USER_A)
    resp = await db_client.post(
        MONITORS_URL, json=VALID_MONITOR, headers=_auth(token)
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == VALID_MONITOR["name"]
    assert data["url"] == VALID_MONITOR["url"]
    assert data["current_status"] == "unknown"
    assert data["is_active"] is True


@requires_db
@pytest.mark.asyncio
async def test_create_monitor_invalid_url(db_client: AsyncClient) -> None:
    token = await _register_and_login(db_client, USER_A)
    bad = {**VALID_MONITOR, "url": "ftp://not-http.com"}
    resp = await db_client.post(MONITORS_URL, json=bad, headers=_auth(token))
    assert resp.status_code == 422


@requires_db
@pytest.mark.asyncio
async def test_create_monitor_interval_too_low(db_client: AsyncClient) -> None:
    token = await _register_and_login(db_client, USER_A)
    bad = {**VALID_MONITOR, "interval_seconds": 30}
    resp = await db_client.post(MONITORS_URL, json=bad, headers=_auth(token))
    assert resp.status_code == 422


@requires_db
@pytest.mark.asyncio
async def test_list_monitors_returns_only_own(db_client: AsyncClient) -> None:
    token_a = await _register_and_login(db_client, USER_A)
    token_b = await _register_and_login(db_client, USER_B)
    await db_client.post(MONITORS_URL, json=VALID_MONITOR, headers=_auth(token_a))
    await db_client.post(MONITORS_URL, json=VALID_MONITOR, headers=_auth(token_b))
    resp = await db_client.get(MONITORS_URL, headers=_auth(token_a))
    assert resp.status_code == 200
    monitors = resp.json()
    assert all(m["user_id"] == monitors[0]["user_id"] for m in monitors)


@requires_db
@pytest.mark.asyncio
async def test_get_monitor_not_found(db_client: AsyncClient) -> None:
    token = await _register_and_login(db_client, USER_A)
    resp = await db_client.get(
        f"{MONITORS_URL}/00000000-0000-0000-0000-000000000000",
        headers=_auth(token),
    )
    assert resp.status_code == 404


@requires_db
@pytest.mark.asyncio
async def test_get_monitor_other_user_forbidden(db_client: AsyncClient) -> None:
    token_a = await _register_and_login(db_client, USER_A)
    token_b = await _register_and_login(db_client, USER_B)
    create_resp = await db_client.post(
        MONITORS_URL, json=VALID_MONITOR, headers=_auth(token_a)
    )
    monitor_id = create_resp.json()["id"]
    # User B tries to access User A's monitor
    resp = await db_client.get(
        f"{MONITORS_URL}/{monitor_id}", headers=_auth(token_b)
    )
    assert resp.status_code == 403


@requires_db
@pytest.mark.asyncio
async def test_update_monitor(db_client: AsyncClient) -> None:
    token = await _register_and_login(db_client, USER_A)
    create_resp = await db_client.post(
        MONITORS_URL, json=VALID_MONITOR, headers=_auth(token)
    )
    monitor_id = create_resp.json()["id"]
    resp = await db_client.patch(
        f"{MONITORS_URL}/{monitor_id}",
        json={"name": "Updated Name", "interval_seconds": 120},
        headers=_auth(token),
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated Name"
    assert resp.json()["interval_seconds"] == 120


@requires_db
@pytest.mark.asyncio
async def test_delete_monitor(db_client: AsyncClient) -> None:
    token = await _register_and_login(db_client, USER_A)
    create_resp = await db_client.post(
        MONITORS_URL, json=VALID_MONITOR, headers=_auth(token)
    )
    monitor_id = create_resp.json()["id"]
    del_resp = await db_client.delete(
        f"{MONITORS_URL}/{monitor_id}", headers=_auth(token)
    )
    assert del_resp.status_code == 204
    # Confirm it's gone
    get_resp = await db_client.get(
        f"{MONITORS_URL}/{monitor_id}", headers=_auth(token)
    )
    assert get_resp.status_code == 404
