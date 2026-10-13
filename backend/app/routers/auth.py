import contextlib
import re
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services import auth_service, status_page_service
from app.utils.jwt import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def register(
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> User:
    try:
        user = await auth_service.create_user(
            db,
            email=body.email,
            password=body.password,
            name=body.name,
        )
        # Create default status page for new user
        default_slug = re.sub(r"[^a-z0-9]", "", body.name.lower())[:20] or "status"
        try:
            await status_page_service.create_status_page(
                db,
                user_id=user.id,
                slug=default_slug,
                title=f"{body.name}'s Status Page",
                description=f"Public status page for {body.name}.",
            )
        except ValueError:
            unique_slug = f"{default_slug}-{uuid.uuid4().hex[:4]}"
            with contextlib.suppress(ValueError):
                await status_page_service.create_status_page(
                    db,
                    user_id=user.id,
                    slug=unique_slug,
                    title=f"{body.name}'s Status Page",
                    description=f"Public status page for {body.name}.",
                )
        await db.commit()
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Log in and receive a JWT access token",
)
async def login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    user = await auth_service.authenticate_user(db, body.email, body.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(subject=str(user.id))
    return TokenResponse(
        access_token=token,
        expires_in=settings.jwt_expire_hours * 3600,
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the current authenticated user's profile",
)
async def me(
    current_user: User = Depends(get_current_user),
) -> User:
    return current_user
