"""Check result schemas — implemented in Phase 4"""
from pydantic import BaseModel


class CheckResultResponse(BaseModel):
    id: int
    checked_at: str
    status: str
    response_time_ms: int | None
    status_code: int | None
    error_message: str | None

    model_config = {"from_attributes": True}


class CheckResultsPage(BaseModel):
    results: list[CheckResultResponse]
    next_cursor: str | None


class UptimeStats(BaseModel):
    monitor_id: str
    uptime_24h: float
    uptime_7d: float
    uptime_30d: float
    avg_response_time_ms_24h: float | None
    total_checks_24h: int
    total_outages_24h: int
