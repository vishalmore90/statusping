"""
JWT authentication dependency.
Used as a FastAPI dependency to protect routes: `get_current_user`.
"""

import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.services import auth_service
from app.utils.jwt import decode_access_token

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    FastAPI dependency that extracts and validates the Bearer JWT.
    Returns the authenticated User or raises HTTP 401.
    """
    token = credentials.credentials
    user_id_str = decode_access_token(token)

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if user_id_str is None:
        raise credentials_exception

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise credentials_exception from None

    user = await auth_service.get_user_by_id(db, user_id)
    if user is None or not user.is_active:
        raise credentials_exception

    return user
