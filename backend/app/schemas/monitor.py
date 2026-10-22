"""Monitor Pydantic schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field, field_validator, model_validator

from app.utils.security import validate_http_url, validate_tcp_target

VALID_MONITOR_TYPES = ("http", "tcp")
MIN_INTERVAL = 60
MAX_INTERVAL = 86400  # 24 hours


class MonitorCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    url: str = Field(min_length=1, max_length=2048)
    monitor_type: str = Field(default="http")
    interval_seconds: int = Field(default=60, ge=MIN_INTERVAL, le=MAX_INTERVAL)
    timeout_seconds: int = Field(default=10, ge=1, le=60)
    expected_status_code: int | None = Field(default=200, ge=100, le=599)
    status_page_id: uuid.UUID | None = None

    @field_validator("monitor_type")
    @classmethod
    def validate_monitor_type(cls, v: str) -> str:
        if v not in VALID_MONITOR_TYPES:
            raise ValueError(f"monitor_type must be one of: {VALID_MONITOR_TYPES}")
        return v

    @model_validator(mode="after")
    def validate_target_url(self) -> "MonitorCreate":
        url_val = self.url.strip()
        if self.monitor_type == "http":
            validate_http_url(url_val, resolve_dns=False)
        elif self.monitor_type == "tcp":
            validate_tcp_target(url_val, resolve_dns=False)
        self.url = url_val
        return self


class MonitorUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    url: str | None = Field(default=None, min_length=1, max_length=2048)
    monitor_type: str | None = None
    interval_seconds: int | None = Field(default=None, ge=MIN_INTERVAL, le=MAX_INTERVAL)
    timeout_seconds: int | None = Field(default=None, ge=1, le=60)
    expected_status_code: int | None = Field(default=None, ge=100, le=599)
    is_active: bool | None = None
    status_page_id: uuid.UUID | None = None

    @field_validator("monitor_type")
    @classmethod
    def validate_monitor_type(cls, v: str | None) -> str | None:
        if v is not None and v not in VALID_MONITOR_TYPES:
            raise ValueError(f"monitor_type must be one of: {VALID_MONITOR_TYPES}")
        return v

    @model_validator(mode="after")
    def validate_target_url(self) -> "MonitorUpdate":
        if self.url is not None:
            url_val = self.url.strip()
            mtype = self.monitor_type or "http"
            if mtype == "http":
                validate_http_url(url_val, resolve_dns=False)
            elif mtype == "tcp":
                validate_tcp_target(url_val, resolve_dns=False)
            self.url = url_val
        return self


class MonitorResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    status_page_id: uuid.UUID | None
    name: str
    url: str
    monitor_type: str
    interval_seconds: int
    timeout_seconds: int
    expected_status_code: int | None
    is_active: bool
    current_status: str
    last_checked_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
