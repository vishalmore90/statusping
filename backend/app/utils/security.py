"""
Security utilities for network validation and SSRF (Server-Side Request Forgery) protection.

All outbound HTTP and TCP monitoring checks MUST pass through these security controls
before connection establishment, and at every redirect hop.
"""

import ipaddress
import socket
import urllib.parse

# Prohibited hostnames explicitly associated with cloud metadata or internal platforms
PROHIBITED_HOSTNAMES = frozenset(
    [
        "localhost",
        "metadata.google.internal",
        "metadata.google",
        "instance-data",
        "metadata",
    ]
)

# Allowed URL schemes for HTTP monitoring
ALLOWED_HTTP_SCHEMES = frozenset(["http", "https"])


def is_prohibited_ip(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    """
    Check if an IP address belongs to any private, loopback, link-local,
    multicast, reserved, or unspecified range.
    """
    if ip.is_loopback:
        return True
    if ip.is_private:
        return True
    if ip.is_link_local:
        return True
    if ip.is_multicast:
        return True
    if ip.is_reserved:
        return True
    if ip.is_unspecified:
        return True

    # Explicit check for AWS/GCP/Azure link-local metadata IP (169.254.169.254)
    if str(ip) == "169.254.169.254":
        return True

    # 0.0.0.0/8 current network
    if isinstance(ip, ipaddress.IPv4Address) and ip in ipaddress.IPv4Network("0.0.0.0/8"):
        return True

    # 255.255.255.255 broadcast
    return str(ip) == "255.255.255.255"


def validate_ip_address_str(ip_str: str) -> None:
    """
    Validate that an IP string does not belong to prohibited ranges.
    Raises ValueError if prohibited or malformed.
    """
    try:
        ip = ipaddress.ip_address(ip_str)
    except ValueError as exc:
        raise ValueError(f"Invalid IP address format: {ip_str}") from exc

    if is_prohibited_ip(ip):
        raise ValueError(
            f"Prohibited destination: IP {ip_str} is in a restricted range "
            f"(loopback, private, link-local, or cloud metadata)."
        )


def validate_hostname_dns(hostname: str, port: int = 80) -> None:
    """
    Resolve hostname via DNS and ensure all returned IP addresses are public.
    Raises ValueError if hostname resolves to any prohibited IP address or is prohibited.
    """
    clean_host = hostname.strip().lower()

    if clean_host in PROHIBITED_HOSTNAMES:
        raise ValueError(f"Prohibited destination hostname: '{clean_host}'.")

    # If the hostname is an IP literal, validate it directly without DNS lookup
    try:
        ip = ipaddress.ip_address(clean_host)
    except ValueError:
        ip = None

    if ip is not None:
        if is_prohibited_ip(ip):
            raise ValueError(
                f"Prohibited destination: IP {clean_host} is in a restricted range "
                f"(loopback, private, link-local, or cloud metadata)."
            )
        return

    # Resolve hostname to all addresses
    try:
        addr_info = socket.getaddrinfo(
            clean_host,
            port,
            proto=socket.IPPROTO_TCP,
        )
    except socket.gaierror as exc:
        raise ValueError(f"DNS resolution failure for host '{clean_host}': {exc}") from exc

    resolved_ips: set[str] = set()
    for entry in addr_info:
        sockaddr = entry[4]
        ip_str = str(sockaddr[0])
        resolved_ips.add(ip_str)

    if not resolved_ips:
        raise ValueError(f"No IP addresses resolved for host '{clean_host}'.")

    for ip_str in resolved_ips:
        try:
            ip_obj = ipaddress.ip_address(ip_str)
        except ValueError as exc:
            raise ValueError(f"Invalid resolved IP '{ip_str}' for host '{clean_host}'") from exc

        if is_prohibited_ip(ip_obj):
            raise ValueError(
                f"Prohibited destination: host '{clean_host}' resolved to restricted IP {ip_str} "
                f"(loopback, private, link-local, or cloud metadata)."
            )


def validate_http_url(url: str, resolve_dns: bool = False) -> None:
    """
    Validate an HTTP/HTTPS URL for SSRF vulnerabilities.

    Checks:
    - URL scheme (only http/https)
    - Hostname presence
    - Prohibited hostnames
    - IP literals in prohibited ranges
    - DNS resolution to public IPs (if resolve_dns is True)
    """
    parsed = urllib.parse.urlparse(url.strip())
    scheme = parsed.scheme.lower()

    if scheme not in ALLOWED_HTTP_SCHEMES:
        raise ValueError(f"Invalid URL scheme '{scheme}'. Only http:// and https:// are permitted.")

    hostname = parsed.hostname
    if not hostname:
        raise ValueError("URL must include a valid hostname.")

    clean_host = hostname.strip().lower()
    if clean_host in PROHIBITED_HOSTNAMES:
        raise ValueError(f"Prohibited destination hostname: '{clean_host}'.")

    # If port is specified, validate range
    if parsed.port is not None and not (1 <= parsed.port <= 65535):
        raise ValueError(f"Invalid port: {parsed.port}. Port must be between 1 and 65535.")

    # Check IP literal directly
    try:
        ip = ipaddress.ip_address(clean_host)
    except ValueError:
        ip = None

    if ip is not None:
        if is_prohibited_ip(ip):
            raise ValueError(
                f"Prohibited destination: IP {clean_host} is in a restricted range "
                f"(loopback, private, link-local, or cloud metadata)."
            )
        return

    if resolve_dns:
        port = parsed.port or (443 if scheme == "https" else 80)
        validate_hostname_dns(clean_host, port)


def validate_tcp_target(target: str, resolve_dns: bool = False) -> tuple[str, int]:
    """
    Validate a TCP target (format: 'host:port' or 'tcp://host:port').
    Returns: (clean_host, port)
    """
    clean_target = target.strip()
    if clean_target.startswith("tcp://"):
        clean_target = clean_target[6:]

    if ":" not in clean_target:
        raise ValueError("TCP target must be in the format 'host:port'.")

    host_part, port_str = clean_target.rsplit(":", 1)
    host_part = host_part.strip().strip("[]")  # Strip brackets for IPv6 literals like [::1]:80

    if not host_part:
        raise ValueError("TCP target must specify a valid host.")

    try:
        port = int(port_str.strip())
    except ValueError as exc:
        raise ValueError(f"Invalid TCP port: '{port_str}'. Must be an integer.") from exc

    if not (1 <= port <= 65535):
        raise ValueError(f"Invalid TCP port: {port}. Port must be between 1 and 65535.")

    clean_host = host_part.lower()
    if clean_host in PROHIBITED_HOSTNAMES:
        raise ValueError(f"Prohibited destination hostname: '{clean_host}'.")

    # Check IP literal directly
    try:
        ip = ipaddress.ip_address(clean_host)
    except ValueError:
        ip = None

    if ip is not None:
        if is_prohibited_ip(ip):
            raise ValueError(
                f"Prohibited destination: IP {clean_host} is in a restricted range "
                f"(loopback, private, link-local, or cloud metadata)."
            )
        return clean_host, port

    if resolve_dns:
        validate_hostname_dns(clean_host, port)

    return clean_host, port
