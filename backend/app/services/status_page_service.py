"""
Status page service: CRUD operations.
MVP: 1 status page per user (enforced here).
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.status_page import StatusPage


async def get_status_page_by_id(db: AsyncSession, page_id: uuid.UUID) -> StatusPage | None:
    result = await db.execute(select(StatusPage).where(StatusPage.id == page_id))
    return result.scalar_one_or_none()


async def get_status_page_by_slug(db: AsyncSession, slug: str) -> StatusPage | None:
    result = await db.execute(select(StatusPage).where(StatusPage.slug == slug))
    return result.scalar_one_or_none()


async def get_user_status_pages(db: AsyncSession, user_id: uuid.UUID) -> list[StatusPage]:
    result = await db.execute(select(StatusPage).where(StatusPage.user_id == user_id))
    return list(result.scalars().all())


async def create_status_page(
    db: AsyncSession,
    user_id: uuid.UUID,
    slug: str,
    title: str,
    description: str | None = None,
) -> StatusPage:
    """
    Create a status page for a user.
    MVP: raises ValueError if the user already has one.
    Raises ValueError if the slug is already taken.
    """
    existing = await get_user_status_pages(db, user_id)
    if existing:
        raise ValueError("You already have a status page. Only 1 is allowed in MVP.")

    page = StatusPage(
        user_id=user_id,
        slug=slug,
        title=title,
        description=description,
    )
    db.add(page)
    try:
        await db.flush()
        await db.refresh(page)
    except IntegrityError:
        await db.rollback()
        raise ValueError(f"Slug '{slug}' is already taken.") from None
    return page


async def update_status_page(
    db: AsyncSession,
    page: StatusPage,
    slug: str | None = None,
    title: str | None = None,
    description: str | None = None,
    is_public: bool | None = None,
) -> StatusPage:
    if slug is not None:
        page.slug = slug
    if title is not None:
        page.title = title
    if description is not None:
        page.description = description
    if is_public is not None:
        page.is_public = is_public
    page.updated_at = datetime.now(UTC)
    db.add(page)
    try:
        await db.flush()
        await db.refresh(page)
    except IntegrityError:
        await db.rollback()
        raise ValueError(f"Slug '{slug}' is already taken.") from None
    return page


async def delete_status_page(db: AsyncSession, page: StatusPage) -> None:
    await db.delete(page)
    await db.flush()
