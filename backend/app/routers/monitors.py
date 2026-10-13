"""Monitors router: /api/v1/monitors"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.monitor import MonitorCreate, MonitorResponse, MonitorUpdate
from app.services import monitor_service

router = APIRouter(prefix="/monitors", tags=["monitors"])


def _require_ownership(monitor_user_id: uuid.UUID, current_user: User) -> None:
    if monitor_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")


@router.get(
    "",
    response_model=list[MonitorResponse],
    summary="List all monitors for the current user",
)
async def list_monitors(
    status_page_id: uuid.UUID | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[MonitorResponse]:
    monitors = await monitor_service.get_user_monitors(
        db,
        user_id=current_user.id,
        status_page_id=status_page_id,
        is_active=is_active,
    )
    return [MonitorResponse.model_validate(m) for m in monitors]


@router.post(
    "",
    response_model=MonitorResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new monitor",
)
async def create_monitor(
    body: MonitorCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MonitorResponse:
    try:
        monitor = await monitor_service.create_monitor(
            db,
            user_id=current_user.id,
            name=body.name,
            url=body.url,
            monitor_type=body.monitor_type,
            interval_seconds=body.interval_seconds,
            timeout_seconds=body.timeout_seconds,
            expected_status_code=body.expected_status_code,
            status_page_id=body.status_page_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return MonitorResponse.model_validate(monitor)


@router.get(
    "/{monitor_id}",
    response_model=MonitorResponse,
    summary="Get a single monitor",
)
async def get_monitor(
    monitor_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MonitorResponse:
    monitor = await monitor_service.get_monitor_by_id(db, monitor_id)
    if monitor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Monitor not found.")
    _require_ownership(monitor.user_id, current_user)
    return MonitorResponse.model_validate(monitor)


@router.patch(
    "/{monitor_id}",
    response_model=MonitorResponse,
    summary="Update a monitor",
)
async def update_monitor(
    monitor_id: uuid.UUID,
    body: MonitorUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MonitorResponse:
    monitor = await monitor_service.get_monitor_by_id(db, monitor_id)
    if monitor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Monitor not found.")
    _require_ownership(monitor.user_id, current_user)
    try:
        monitor = await monitor_service.update_monitor(
            db,
            monitor,
            user_id=current_user.id,
            name=body.name,
            url=body.url,
            monitor_type=body.monitor_type,
            interval_seconds=body.interval_seconds,
            timeout_seconds=body.timeout_seconds,
            expected_status_code=body.expected_status_code,
            is_active=body.is_active,
            status_page_id=body.status_page_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return MonitorResponse.model_validate(monitor)


@router.delete(
    "/{monitor_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a monitor and all its check results",
)
async def delete_monitor(
    monitor_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    monitor = await monitor_service.get_monitor_by_id(db, monitor_id)
    if monitor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Monitor not found.")
    _require_ownership(monitor.user_id, current_user)
    await monitor_service.delete_monitor(db, monitor)
