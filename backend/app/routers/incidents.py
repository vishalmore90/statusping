"""Incidents router: /api/v1/incidents"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.incident import (
    VALID_IMPACTS,
    VALID_STATUSES,
    IncidentCreate,
    IncidentPatch,
    IncidentResponse,
    IncidentUpdateCreate,
    IncidentUpdateResponse,
)
from app.services import incident_service

router = APIRouter(prefix="/incidents", tags=["incidents"])


def _require_ownership(incident_user_id: uuid.UUID, current_user: User) -> None:
    if incident_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")


def _validate_status(s: str) -> None:
    if s not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"status must be one of: {VALID_STATUSES}",
        )


def _validate_impact(i: str) -> None:
    if i not in VALID_IMPACTS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"impact must be one of: {VALID_IMPACTS}",
        )


@router.get(
    "",
    response_model=list[IncidentResponse],
    summary="List incidents for the current user",
)
async def list_incidents(
    status_page_id: uuid.UUID | None = Query(default=None),
    resolved: bool | None = Query(default=None, description="Filter by resolved state"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[IncidentResponse]:
    incidents = await incident_service.get_user_incidents(
        db,
        current_user.id,
        status_page_id=status_page_id,
        resolved=resolved,
        limit=limit,
        offset=offset,
    )
    return [IncidentResponse.model_validate(i) for i in incidents]


@router.post(
    "",
    response_model=IncidentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a manual incident",
)
async def create_incident(
    body: IncidentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> IncidentResponse:
    _validate_status(body.status)
    _validate_impact(body.impact)
    incident = await incident_service.create_incident(
        db,
        user_id=current_user.id,
        title=body.title,
        status=body.status,
        impact=body.impact,
        status_page_id=body.status_page_id,
        initial_message=body.initial_message,
    )
    return IncidentResponse.model_validate(incident)


@router.get(
    "/{incident_id}",
    response_model=IncidentResponse,
    summary="Get a single incident with updates",
)
async def get_incident(
    incident_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> IncidentResponse:
    incident = await incident_service.get_incident_by_id(db, incident_id)
    if incident is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")
    _require_ownership(incident.user_id, current_user)
    return IncidentResponse.model_validate(incident)


@router.patch(
    "/{incident_id}",
    response_model=IncidentResponse,
    summary="Update incident metadata",
)
async def patch_incident(
    incident_id: uuid.UUID,
    body: IncidentPatch,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> IncidentResponse:
    incident = await incident_service.get_incident_by_id(db, incident_id)
    if incident is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")
    _require_ownership(incident.user_id, current_user)
    if body.status:
        _validate_status(body.status)
    if body.impact:
        _validate_impact(body.impact)
    incident = await incident_service.update_incident(
        db, incident, title=body.title, status=body.status, impact=body.impact
    )
    return IncidentResponse.model_validate(incident)


@router.post(
    "/{incident_id}/updates",
    response_model=IncidentUpdateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a status update to an incident",
)
async def add_update(
    incident_id: uuid.UUID,
    body: IncidentUpdateCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> IncidentUpdateResponse:
    incident = await incident_service.get_incident_by_id(db, incident_id, load_updates=False)
    if incident is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")
    _require_ownership(incident.user_id, current_user)
    _validate_status(body.status)
    update = await incident_service.add_incident_update(db, incident, body.message, body.status)
    return IncidentUpdateResponse.model_validate(update)


@router.post(
    "/{incident_id}/resolve",
    response_model=IncidentResponse,
    summary="Resolve an incident",
)
async def resolve_incident(
    incident_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> IncidentResponse:
    incident = await incident_service.get_incident_by_id(db, incident_id)
    if incident is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")
    _require_ownership(incident.user_id, current_user)
    if incident.resolved_at is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Incident is already resolved."
        )
    incident = await incident_service.resolve_incident(db, incident)
    return IncidentResponse.model_validate(incident)


@router.delete(
    "/{incident_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an incident",
)
async def delete_incident(
    incident_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    incident = await incident_service.get_incident_by_id(db, incident_id, load_updates=False)
    if incident is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")
    _require_ownership(incident.user_id, current_user)
    await incident_service.delete_incident(db, incident)
