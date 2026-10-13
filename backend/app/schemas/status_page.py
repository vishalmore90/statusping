"""Status page Pydantic schemas."""

import re
import uuid
from datetime import datetime

from pydantic import BaseModel, Field, field_validator

_SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9\-]{0,98}[a-z0-9]$|^[a-z0-9]$")


class StatusPageCreate(BaseModel):
    slug: str = Field(min_length=1, max_length=100)
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=1000)

    @field_validator("slug")
    @classmethod
    def slug_format(cls, v: str) -> str:
        v = v.lower().strip()
        if not _SLUG_RE.match(v):
            raise ValueError(
                "Slug must contain only lowercase letters, digits, and hyphens, "
                "and must not start or end with a hyphen."
            )
        return v


class StatusPageUpdate(BaseModel):
    slug: str | None = Field(default=None, min_length=1, max_length=100)
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    is_public: bool | None = None

    @field_validator("slug")
    @classmethod
    def slug_format(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.lower().strip()
        if not _SLUG_RE.match(v):
            raise ValueError(
                "Slug must contain only lowercase letters, digits, and hyphens."
            )
        return v


class StatusPageResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    slug: str
    title: str
    description: str | None
    is_public: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
