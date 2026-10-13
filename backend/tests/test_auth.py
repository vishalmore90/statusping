"""
Auth endpoint tests.
All tests in this file require a live PostgreSQL connection.
They are skipped automatically when PG is not reachable.
"""

import pytest
from httpx import AsyncClient

from tests.conftest import requires_db

REGISTER_URL = "/api/v1/auth/register"
LOGIN_URL = "/api/v1/auth/login"
ME_URL = "/api/v1/auth/me"

VALID_USER = {
    "email": "test@example.com",
    "password": "securepassword123",
    "name": "Test User",
}


@requires_db
@pytest.mark.asyncio
async def test_register_success(db_client: AsyncClient) -> None:
    response = await db_client.post(REGISTER_URL, json=VALID_USER)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == VALID_USER["email"]
    assert data["name"] == VALID_USER["name"]
    assert "id" in data
    assert "password_hash" not in data  # never expose hash


@requires_db
@pytest.mark.asyncio
async def test_register_duplicate_email(db_client: AsyncClient) -> None:
    await db_client.post(REGISTER_URL, json=VALID_USER)
    response = await db_client.post(REGISTER_URL, json=VALID_USER)
    assert response.status_code == 409
    assert "already registered" in response.json()["detail"].lower()


@requires_db
@pytest.mark.asyncio
async def test_register_short_password(db_client: AsyncClient) -> None:
    payload = {**VALID_USER, "password": "short"}
    response = await db_client.post(REGISTER_URL, json=payload)
    assert response.status_code == 422  # pydantic validation


@requires_db
@pytest.mark.asyncio
async def test_login_success(db_client: AsyncClient) -> None:
    await db_client.post(REGISTER_URL, json=VALID_USER)
    response = await db_client.post(
        LOGIN_URL,
        json={"email": VALID_USER["email"], "password": VALID_USER["password"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert isinstance(data["expires_in"], int)


@requires_db
@pytest.mark.asyncio
async def test_login_wrong_password(db_client: AsyncClient) -> None:
    await db_client.post(REGISTER_URL, json=VALID_USER)
    response = await db_client.post(
        LOGIN_URL,
        json={"email": VALID_USER["email"], "password": "wrongpassword"},
    )
    assert response.status_code == 401
    # Must not reveal whether the email exists
    assert "invalid email or password" in response.json()["detail"].lower()


@requires_db
@pytest.mark.asyncio
async def test_login_unknown_email(db_client: AsyncClient) -> None:
    response = await db_client.post(
        LOGIN_URL,
        json={"email": "nobody@example.com", "password": "anything"},
    )
    assert response.status_code == 401
    assert "invalid email or password" in response.json()["detail"].lower()


@requires_db
@pytest.mark.asyncio
async def test_me_authenticated(db_client: AsyncClient) -> None:
    # Register + login to get token
    await db_client.post(REGISTER_URL, json=VALID_USER)
    login_resp = await db_client.post(
        LOGIN_URL,
        json={"email": VALID_USER["email"], "password": VALID_USER["password"]},
    )
    token = login_resp.json()["access_token"]

    # Call /me with the token
    response = await db_client.get(ME_URL, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == VALID_USER["email"]


@pytest.mark.asyncio
async def test_me_unauthenticated(client: AsyncClient) -> None:
    """No token — must return 401 (HTTPBearer requires credentials)."""
    response = await client.get(ME_URL)
    assert response.status_code in (401, 403)  # varies by FastAPI/Starlette version


@pytest.mark.asyncio
async def test_me_invalid_token(client: AsyncClient) -> None:
    response = await client.get(ME_URL, headers={"Authorization": "Bearer this.is.not.valid"})
    assert response.status_code == 401
