"""
Check service unit tests.
These use unittest.mock to mock httpx — no real HTTP or DB needed.
"""

import uuid
from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.check_service import _perform_http_check, compute_uptime

# ── HTTP check unit tests (no DB, no network) ─────────────────────────────────


@pytest.mark.asyncio
async def test_http_check_up() -> None:
    """200 response with expected_status_code=200 → 'up'."""
    mock_response = MagicMock()
    mock_response.status_code = 200

    mock_client = AsyncMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    mock_client.get = AsyncMock(return_value=mock_response)

    with patch("app.services.check_service.httpx.AsyncClient", return_value=mock_client):
        status, rt_ms, code, err = await _perform_http_check(
            "https://example.com", timeout_seconds=10, expected_status_code=200
        )

    assert status == "up"
    assert code == 200
    assert err is None
    assert rt_ms is not None and rt_ms >= 0


@pytest.mark.asyncio
async def test_http_check_down_wrong_status() -> None:
    """500 response when 200 expected → 'down'."""
    mock_response = MagicMock()
    mock_response.status_code = 500

    mock_client = AsyncMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    mock_client.get = AsyncMock(return_value=mock_response)

    with patch("app.services.check_service.httpx.AsyncClient", return_value=mock_client):
        status, rt_ms, code, err = await _perform_http_check(
            "https://example.com", timeout_seconds=10, expected_status_code=200
        )

    assert status == "down"
    assert code == 500
    assert err is None


@pytest.mark.asyncio
async def test_http_check_timeout() -> None:
    """Timeout → 'down' with error message."""
    import httpx

    mock_client = AsyncMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    mock_client.get = AsyncMock(
        side_effect=httpx.TimeoutException("timed out", request=MagicMock())
    )

    with patch("app.services.check_service.httpx.AsyncClient", return_value=mock_client):
        status, rt_ms, code, err = await _perform_http_check(
            "https://slow.example.com", timeout_seconds=5, expected_status_code=200
        )

    assert status == "down"
    assert code is None
    assert err is not None
    assert "timed out" in err.lower()


@pytest.mark.asyncio
async def test_http_check_connection_error() -> None:
    """Network error → 'down' with error message."""
    import httpx

    mock_client = AsyncMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    mock_client.get = AsyncMock(side_effect=httpx.ConnectError("refused", request=MagicMock()))

    with patch("app.services.check_service.httpx.AsyncClient", return_value=mock_client):
        status, rt_ms, code, err = await _perform_http_check(
            "https://down.example.com", timeout_seconds=5, expected_status_code=200
        )

    assert status == "down"
    assert err is not None
    assert "ConnectError" in err


@pytest.mark.asyncio
async def test_http_check_custom_status_code() -> None:
    """Custom expected status code (201) is matched correctly."""
    mock_response = MagicMock()
    mock_response.status_code = 201

    mock_client = AsyncMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    mock_client.get = AsyncMock(return_value=mock_response)

    with patch("app.services.check_service.httpx.AsyncClient", return_value=mock_client):
        status, _, code, err = await _perform_http_check(
            "https://api.example.com", timeout_seconds=10, expected_status_code=201
        )

    assert status == "up"
    assert code == 201


# ── Uptime computation unit tests (with mock DB) ──────────────────────────────


@pytest.mark.asyncio
async def test_compute_uptime_all_up() -> None:
    """100% uptime when all results are 'up'."""
    monitor_id = uuid.uuid4()

    mock_results = [
        MagicMock(status="up", checked_at=datetime.now(UTC)),
        MagicMock(status="up", checked_at=datetime.now(UTC)),
        MagicMock(status="up", checked_at=datetime.now(UTC)),
    ]

    mock_db = AsyncMock()
    mock_scalars = MagicMock()
    mock_scalars.all.return_value = mock_results
    mock_execute = MagicMock()
    mock_execute.scalars.return_value = mock_scalars
    mock_db.execute = AsyncMock(return_value=mock_execute)

    uptime = await compute_uptime(mock_db, monitor_id, days=1)
    assert uptime == 100.0


@pytest.mark.asyncio
async def test_compute_uptime_mixed() -> None:
    """2 up, 2 down → 50% uptime."""
    monitor_id = uuid.uuid4()

    mock_results = [
        MagicMock(status="up"),
        MagicMock(status="up"),
        MagicMock(status="down"),
        MagicMock(status="down"),
    ]

    mock_db = AsyncMock()
    mock_scalars = MagicMock()
    mock_scalars.all.return_value = mock_results
    mock_execute = MagicMock()
    mock_execute.scalars.return_value = mock_scalars
    mock_db.execute = AsyncMock(return_value=mock_execute)

    uptime = await compute_uptime(mock_db, monitor_id, days=1)
    assert uptime == 50.0


@pytest.mark.asyncio
async def test_compute_uptime_no_results() -> None:
    """No check results yet → assumed 100% uptime."""
    monitor_id = uuid.uuid4()

    mock_db = AsyncMock()
    mock_scalars = MagicMock()
    mock_scalars.all.return_value = []
    mock_execute = MagicMock()
    mock_execute.scalars.return_value = mock_scalars
    mock_db.execute = AsyncMock(return_value=mock_execute)

    uptime = await compute_uptime(mock_db, monitor_id, days=1)
    assert uptime == 100.0


@pytest.mark.asyncio
async def test_tcp_check_up() -> None:
    """Successful TCP connection → 'up'."""
    from app.services.check_service import _perform_tcp_check

    mock_writer = AsyncMock()
    mock_writer.close = MagicMock()
    mock_writer.wait_closed = AsyncMock()

    with patch("asyncio.open_connection", new=AsyncMock(return_value=(AsyncMock(), mock_writer))):
        status, rt_ms, code, err = await _perform_tcp_check("localhost:5432", timeout_seconds=5)

    assert status == "up"
    assert code is None
    assert err is None
    assert rt_ms is not None and rt_ms >= 0


@pytest.mark.asyncio
async def test_tcp_check_connection_error() -> None:
    """Connection refused on TCP → 'down'."""
    from app.services.check_service import _perform_tcp_check

    with patch("asyncio.open_connection", side_effect=ConnectionRefusedError("Connection refused")):
        status, rt_ms, code, err = await _perform_tcp_check("localhost:9999", timeout_seconds=5)

    assert status == "down"
    assert err is not None and "TCP connection error" in err
