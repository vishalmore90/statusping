"""
Auth, JWT, and Security Verification Unit Tests.

Covers:
- JWT creation and decoding with correct subject
- Token decoding when 'sub' claim is absent/None (does not return 'None' string)
- Malformed or tampered JWT signatures
- Expired token behavior
- Password hashing and verification
"""

from datetime import UTC, datetime, timedelta

from jose import jwt

from app.config import settings
from app.utils.hashing import hash_password, verify_password
from app.utils.jwt import create_access_token, decode_access_token


def test_jwt_create_and_decode_valid() -> None:
    user_id = "12345678-1234-5678-1234-567812345678"
    token = create_access_token(user_id)
    decoded = decode_access_token(token)
    assert decoded == user_id


def test_jwt_decode_missing_sub_returns_none() -> None:
    """A token payload with no 'sub' key must return None, not string 'None'."""
    expire = datetime.now(UTC) + timedelta(hours=1)
    payload = {"custom_data": "123", "exp": expire}
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)

    decoded = decode_access_token(token)
    assert decoded is None


def test_jwt_decode_invalid_signature() -> None:
    valid_token = create_access_token("user-id")
    # Tamper with the token
    tampered = valid_token[:-4] + "xxxx"
    assert decode_access_token(tampered) is None


def test_jwt_decode_expired_token() -> None:
    expire = datetime.now(UTC) - timedelta(hours=1)
    payload = {"sub": "user-123", "exp": expire}
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)

    assert decode_access_token(token) is None


def test_password_hashing_and_verification() -> None:
    raw_pass = "SuperSecretPassword123!"
    hashed = hash_password(raw_pass)

    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False
