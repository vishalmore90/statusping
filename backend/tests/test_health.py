"""Health and readiness endpoint tests.
Covers:
- /health and /health/live liveness probes
- /health/ready readiness probe with connected DB (200)
- /health/ready readiness probe with disconnected/errored DB (503)
"""

from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_liveness(client: AsyncClient) -> None:
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

    response_live = await client.get("/health/live")
    assert response_live.status_code == 200
    assert response_live.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_health_readiness_connected(client: AsyncClient) -> None:
    """When DB is connected, /health/ready returns 200 ready."""
    mock_session = AsyncMock()
    mock_session.__aenter__ = AsyncMock(return_value=mock_session)
    mock_session.__aexit__ = AsyncMock(return_value=False)
    mock_session.execute = AsyncMock()

    with patch("app.main.AsyncSessionLocal", return_value=mock_session):
        response = await client.get("/health/ready")

    assert response.status_code == 200
    assert response.json() == {"status": "ready", "database": "connected"}


@pytest.mark.asyncio
async def test_health_readiness_disconnected(client: AsyncClient) -> None:
    """When DB is unreachable, /health/ready returns 503 unready without leaking credentials."""
    mock_session = AsyncMock()
    mock_session.__aenter__ = AsyncMock(side_effect=OSError("Database connection refused"))
    mock_session.__aexit__ = AsyncMock(return_value=False)

    with patch("app.main.AsyncSessionLocal", return_value=mock_session):
        response = await client.get("/health/ready")

    assert response.status_code == 503
    assert response.json() == {"status": "unready", "database": "disconnected"}
