"""Status pages router: /api/v1/status-pages"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.status_page import StatusPageCreate, StatusPageResponse, StatusPageUpdate
from app.services import status_page_service

router = APIRouter(prefix="/status-pages", tags=["status-pages"])


def _require_ownership(page_user_id: uuid.UUID, current_user: User) -> None:
    if page_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")


@router.post(
    "",
    response_model=StatusPageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a status page (1 per user in MVP)",
)
async def create_status_page(
    body: StatusPageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StatusPageResponse:
    try:
        page = await status_page_service.create_status_page(
            db,
            user_id=current_user.id,
            slug=body.slug,
            title=body.title,
            description=body.description,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return StatusPageResponse.model_validate(page)


@router.get(
    "",
    response_model=list[StatusPageResponse],
    summary="List current user's status pages",
)
async def list_status_pages(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[StatusPageResponse]:
    pages = await status_page_service.get_user_status_pages(db, current_user.id)
    return [StatusPageResponse.model_validate(p) for p in pages]


@router.get(
    "/{page_id}",
    response_model=StatusPageResponse,
    summary="Get a single status page",
)
async def get_status_page(
    page_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StatusPageResponse:
    page = await status_page_service.get_status_page_by_id(db, page_id)
    if page is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Status page not found.")
    _require_ownership(page.user_id, current_user)
    return StatusPageResponse.model_validate(page)


@router.patch(
    "/{page_id}",
    response_model=StatusPageResponse,
    summary="Update a status page",
)
async def update_status_page(
    page_id: uuid.UUID,
    body: StatusPageUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StatusPageResponse:
    page = await status_page_service.get_status_page_by_id(db, page_id)
    if page is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Status page not found.")
    _require_ownership(page.user_id, current_user)
    try:
        page = await status_page_service.update_status_page(
            db,
            page,
            slug=body.slug,
            title=body.title,
            description=body.description,
            is_public=body.is_public,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return StatusPageResponse.model_validate(page)


@router.delete(
    "/{page_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a status page",
)
async def delete_status_page(
    page_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    page = await status_page_service.get_status_page_by_id(db, page_id)
    if page is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Status page not found.")
    _require_ownership(page.user_id, current_user)
    await status_page_service.delete_status_page(db, page)
