"""Incident Pydantic schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

VALID_STATUSES = ("investigating", "identified", "monitoring", "resolved")
VALID_IMPACTS = ("none", "minor", "major", "critical")


class IncidentUpdateResponse(BaseModel):
    id: uuid.UUID
    message: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class IncidentResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    status_page_id: uuid.UUID | None
    monitor_id: uuid.UUID | None
    title: str
    status: str
    impact: str
    started_at: datetime
    resolved_at: datetime | None
    created_at: datetime
    updated_at: datetime
    updates: list[IncidentUpdateResponse] = []

    model_config = {"from_attributes": True}


class IncidentCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    status: str = Field(default="investigating")
    impact: str = Field(default="none")
    status_page_id: uuid.UUID | None = None
    initial_message: str | None = None


class IncidentUpdateCreate(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    status: str


class IncidentPatch(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    status: str | None = None
    impact: str | None = None
