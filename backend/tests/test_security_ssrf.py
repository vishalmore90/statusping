"""
SSRF (Server-Side Request Forgery) and Network Security Test Suite.

Verifies that the monitoring engine strictly blocks:
- Loopback addresses (IPv4 & IPv6)
- Private network ranges (RFC 1918)
- Link-local and cloud metadata addresses (169.254.169.254)
- Prohibited hostnames (localhost, metadata.google.internal)
- Prohibited and unexpected URL schemes
- Invalid ports and destination protocols
- Redirect chains leading to internal/metadata endpoints
- Pydantic schema validation at monitor creation and update time
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from pydantic import ValidationError

from app.schemas.monitor import MonitorCreate, MonitorUpdate
from app.services.check_service import _perform_http_check, _perform_tcp_check
from app.utils.security import (
    validate_hostname_dns,
    validate_http_url,
    validate_tcp_target,
)

# ── URL and Scheme Validation ──────────────────────────────────────────────────


def test_valid_public_urls() -> None:
    validate_http_url("https://example.com")
    validate_http_url("http://example.com/api/v1/health")
    validate_http_url("https://example.com:8443/status")
    validate_http_url("https://8.8.8.8/test")


@pytest.mark.parametrize(
    "prohibited_url",
    [
        "ftp://example.com/file",
        "file:///etc/passwd",
        "gopher://127.0.0.1:70",
        "javascript:alert(1)",
        "data:text/html,test",
        "ws://example.com/socket",
        "http://",
        "not-a-url",
    ],
)
def test_invalid_or_disallowed_schemes(prohibited_url: str) -> None:
    with pytest.raises(ValueError):
        validate_http_url(prohibited_url)


# ── IPv4 Loopback, Private, and Cloud Metadata Blocking ───────────────────────


@pytest.mark.parametrize(
    "private_url",
    [
        "http://localhost",
        "http://localhost:8000",
        "http://127.0.0.1",
        "http://127.0.0.1:5432",
        "http://127.0.1.1:80",
        "http://127.255.255.254",
        "http://10.0.0.1",
        "http://10.255.255.255:8080",
        "http://172.16.0.1",
        "http://172.31.255.255:3000",
        "http://192.168.1.1",
        "http://192.168.0.254:80",
        "http://169.254.169.254",  # AWS/GCP/Azure link-local metadata
        "http://169.254.169.254/latest/meta-data/",
        "http://169.254.1.1",  # Link-local subnet
        "http://0.0.0.0:8000",  # Unspecified address
        "http://255.255.255.255",  # Broadcast
        "http://metadata.google.internal",
        "http://instance-data",
    ],
)
def test_private_ipv4_and_metadata_blocked(private_url: str) -> None:
    with pytest.raises(ValueError) as excinfo:
        validate_http_url(private_url)
    assert any(
        kw in str(excinfo.value).lower()
        for kw in ["prohibited", "restricted", "invalid", "metadata"]
    )


# ── IPv6 Loopback, Private, and Link-Local Blocking ───────────────────────────


@pytest.mark.parametrize(
    "ipv6_url",
    [
        "http://[::1]",
        "http://[::1]:8000",
        "http://[fe80::1]",  # Link-local IPv6
        "http://[fc00::1]",  # Unique local IPv6
        "http://[fd00::1]",  # Unique local IPv6
        "http://[::]",  # Unspecified IPv6
    ],
)
def test_private_ipv6_blocked(ipv6_url: str) -> None:
    with pytest.raises(ValueError):
        validate_http_url(ipv6_url)


# ── TCP Target Validation ──────────────────────────────────────────────────────


def test_valid_tcp_targets() -> None:
    host, port = validate_tcp_target("example.com:80")
    assert host == "example.com"
    assert port == 80

    host, port = validate_tcp_target("tcp://8.8.8.8:443")
    assert host == "8.8.8.8"
    assert port == 443


@pytest.mark.parametrize(
    "invalid_tcp",
    [
        "example.com",  # Missing port
        "example.com:0",  # Port out of range
        "example.com:70000",  # Port out of range
        "example.com:invalid",  # Port not integer
        "localhost:5432",  # Loopback
        "127.0.0.1:8000",  # Loopback
        "10.0.0.1:22",  # Private
        "192.168.1.1:80",  # Private
        "169.254.169.254:80",  # Metadata
        "[::1]:80",  # IPv6 loopback
    ],
)
def test_invalid_tcp_targets(invalid_tcp: str) -> None:
    with pytest.raises(ValueError):
        validate_tcp_target(invalid_tcp)


# ── DNS Resolution Validation ─────────────────────────────────────────────────


def test_dns_resolution_blocks_private_ip() -> None:
    """If DNS resolution returns a private IP, it must be rejected."""
    mock_addrinfo = [
        (
            2,
            1,
            6,
            "",
            ("127.0.0.1", 80),
        )  # Sockaddr tuple with loopback IP
    ]
    with (
        patch("socket.getaddrinfo", return_value=mock_addrinfo),
        pytest.raises(ValueError, match="restricted IP"),
    ):
        validate_hostname_dns("evil-rebind.internal", 80)


def test_dns_resolution_allows_public_ip() -> None:
    mock_addrinfo = [(2, 1, 6, "", ("93.184.216.34", 80))]
    with patch("socket.getaddrinfo", return_value=mock_addrinfo):
        validate_hostname_dns("example.com", 80)


# ── Schema-Level SSRF Prevention ──────────────────────────────────────────────


def test_monitor_create_blocks_ssrf() -> None:
    with pytest.raises(ValidationError):
        MonitorCreate(name="Localhost Probe", url="http://127.0.0.1:8000", monitor_type="http")

    with pytest.raises(ValidationError):
        MonitorCreate(
            name="Metadata Probe", url="http://169.254.169.254/latest/", monitor_type="http"
        )

    with pytest.raises(ValidationError):
        MonitorCreate(name="TCP Internal", url="127.0.0.1:5432", monitor_type="tcp")


def test_monitor_create_valid() -> None:
    m_http = MonitorCreate(name="Public Site", url="https://example.com", monitor_type="http")
    assert m_http.url == "https://example.com"

    m_tcp = MonitorCreate(name="Public TCP", url="example.com:443", monitor_type="tcp")
    assert m_tcp.url == "example.com:443"


def test_monitor_update_blocks_ssrf() -> None:
    with pytest.raises(ValidationError):
        MonitorUpdate(url="http://10.0.0.1:80")


# ── Runtime Check Execution SSRF & Redirect Protection ────────────────────────


@pytest.mark.asyncio
async def test_perform_http_check_blocks_prohibited_initial_url() -> None:
    status, _, code, err = await _perform_http_check("http://127.0.0.1:8000", 5, 200)
    assert status == "down"
    assert err is not None
    assert "Destination security check failed" in err


@pytest.mark.asyncio
async def test_perform_http_check_blocks_malicious_redirect() -> None:
    """
    An external request returning a 302 redirect to the cloud metadata service
    must be intercepted and rejected by the redirect validator.
    """
    initial_response = MagicMock()
    initial_response.status_code = 302
    initial_response.headers = {"Location": "http://169.254.169.254/latest/meta-data/"}

    mock_client = AsyncMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    mock_client.get = AsyncMock(return_value=initial_response)

    with patch("app.services.check_service.httpx.AsyncClient", return_value=mock_client):
        status, _, code, err = await _perform_http_check("https://example.com/redirect", 5, 200)

    assert status == "down"
    assert code == 302
    assert err is not None
    assert "Redirect to prohibited destination blocked" in err


@pytest.mark.asyncio
async def test_perform_http_check_follows_safe_redirect() -> None:
    """Safe redirect chain to another public URL succeeds."""
    redirect_response = MagicMock()
    redirect_response.status_code = 301
    redirect_response.headers = {"Location": "https://example.com/target"}

    final_response = MagicMock()
    final_response.status_code = 200
    final_response.headers = {}

    mock_client = AsyncMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    mock_client.get = AsyncMock(side_effect=[redirect_response, final_response])

    with patch("app.services.check_service.httpx.AsyncClient", return_value=mock_client):
        status, _, code, err = await _perform_http_check("https://example.com/start", 5, 200)

    assert status == "up"
    assert code == 200
    assert err is None


@pytest.mark.asyncio
async def test_perform_tcp_check_blocks_prohibited_target() -> None:
    status, _, code, err = await _perform_tcp_check("127.0.0.1:5432", 5)
    assert status == "down"
    assert err is not None
    assert "Destination security check failed" in err
