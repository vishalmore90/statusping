"""Public status page response schemas."""

import uuid
from datetime import date, datetime

from pydantic import BaseModel


class DailyUptime(BaseModel):
    date: date
    uptime_percentage: float


class PublicMonitor(BaseModel):
    id: uuid.UUID
    name: str
    current_status: str
    uptime_percentage_90d: float
    avg_response_time_ms: float | None
    status_history_90d: list[DailyUptime]  # 90 entries, oldest first


class PublicIncidentUpdate(BaseModel):
    message: str
    status: str
    created_at: datetime


class PublicIncident(BaseModel):
    id: uuid.UUID
    title: str
    status: str
    impact: str
    started_at: datetime
    resolved_at: datetime | None
    updates: list[PublicIncidentUpdate]


class PublicStatusPage(BaseModel):
    slug: str
    title: str
    description: str | None
    overall_status: str  # operational | degraded_performance | partial_outage | major_outage
    monitors: list[PublicMonitor]
    incidents: list[PublicIncident]
    last_updated: datetime
