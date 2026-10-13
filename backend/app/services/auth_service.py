"""
Auth service: user creation, lookup, and credential verification.
No HTTP or router concerns — pure business logic.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.utils.hashing import hash_password, verify_password


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession,
    email: str,
    password: str,
    name: str,
) -> User:
    """
    Create a new user.

    Raises:
        ValueError: if the email is already registered.
    """
    user = User(
        email=email.lower().strip(),
        password_hash=hash_password(password),
        name=name.strip(),
    )
    db.add(user)
    try:
        await db.flush()  # flush to catch UNIQUE violation before commit
    except IntegrityError:
        await db.rollback()
        raise ValueError(f"Email '{email}' is already registered.") from None
    return user


async def authenticate_user(
    db: AsyncSession,
    email: str,
    password: str,
) -> User | None:
    """
    Verify email + password. Returns the User on success, None on failure.
    Always performs the bcrypt check to prevent timing-based email enumeration.
    """
    user = await get_user_by_email(db, email.lower().strip())
    if user is None:
        # Run a dummy check to equalise timing
        hash_password("dummy-timing-guard")
        return None
    if not verify_password(password, user.password_hash):
        return None
    if not user.is_active:
        return None
    return user
