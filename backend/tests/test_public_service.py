"""
Public service unit tests.
Tests cover: overall_status computation and daily uptime bar logic.
No DB or network needed — pure Python aggregation functions.
"""

import uuid
from datetime import UTC, datetime, timedelta
from unittest.mock import MagicMock

from app.services.public_service import (
    _build_daily_bars,
    _compute_90d_uptime,
    _compute_avg_response_time,
    _compute_overall_status,
)

# ── Helpers ───────────────────────────────────────────────────────────────────


def _make_monitor(status: str = "up") -> MagicMock:
    m = MagicMock()
    m.id = uuid.uuid4()
    m.current_status = status
    return m


def _make_check(
    monitor_id: uuid.UUID,
    status: str,
    days_ago: int,
    response_time_ms: int | None = 100,
) -> MagicMock:
    c = MagicMock()
    c.monitor_id = monitor_id
    c.status = status
    c.checked_at = datetime.now(UTC) - timedelta(days=days_ago)
    c.response_time_ms = response_time_ms
    return c


# ── overall_status ────────────────────────────────────────────────────────────


def test_overall_status_no_monitors() -> None:
    assert _compute_overall_status([]) == "operational"


def test_overall_status_all_up() -> None:
    monitors = [_make_monitor("up"), _make_monitor("up"), _make_monitor("up")]
    assert _compute_overall_status(monitors) == "operational"


def test_overall_status_unknown_treated_as_not_down() -> None:
    monitors = [_make_monitor("unknown"), _make_monitor("up")]
    assert _compute_overall_status(monitors) == "operational"


def test_overall_status_minority_down() -> None:
    """1 of 3 down → partial_outage."""
    monitors = [_make_monitor("down"), _make_monitor("up"), _make_monitor("up")]
    assert _compute_overall_status(monitors) == "partial_outage"


def test_overall_status_majority_down() -> None:
    """2 of 3 down → major_outage."""
    monitors = [_make_monitor("down"), _make_monitor("down"), _make_monitor("up")]
    assert _compute_overall_status(monitors) == "major_outage"


def test_overall_status_all_down() -> None:
    monitors = [_make_monitor("down"), _make_monitor("down")]
    assert _compute_overall_status(monitors) == "major_outage"


# ── 90-day uptime ─────────────────────────────────────────────────────────────


def test_90d_uptime_no_checks() -> None:
    assert _compute_90d_uptime([], uuid.uuid4()) == 100.0


def test_90d_uptime_all_up() -> None:
    mid = uuid.uuid4()
    checks = [_make_check(mid, "up", i) for i in range(10)]
    assert _compute_90d_uptime(checks, mid) == 100.0


def test_90d_uptime_half_down() -> None:
    mid = uuid.uuid4()
    checks = [_make_check(mid, "up", i) for i in range(5)] + [
        _make_check(mid, "down", i) for i in range(5, 10)
    ]
    assert _compute_90d_uptime(checks, mid) == 50.0


def test_90d_uptime_ignores_other_monitors() -> None:
    """Checks for other monitors must not affect this monitor's uptime."""
    mid = uuid.uuid4()
    other = uuid.uuid4()
    checks = [
        _make_check(mid, "up", 1),
        _make_check(other, "down", 1),  # should be ignored
        _make_check(other, "down", 2),
    ]
    assert _compute_90d_uptime(checks, mid) == 100.0


# ── Daily uptime bars ─────────────────────────────────────────────────────────


def test_daily_bars_length() -> None:
    mid = uuid.uuid4()
    bars = _build_daily_bars([], mid, days=90)
    assert len(bars) == 90


def test_daily_bars_oldest_first() -> None:
    mid = uuid.uuid4()
    bars = _build_daily_bars([], mid, days=7)
    assert bars[0].date < bars[-1].date


def test_daily_bars_no_checks_all_100() -> None:
    mid = uuid.uuid4()
    bars = _build_daily_bars([], mid, days=7)
    assert all(b.uptime_percentage == 100.0 for b in bars)


def test_daily_bars_today_all_down() -> None:
    mid = uuid.uuid4()
    # 3 checks today, all down
    checks = [_make_check(mid, "down", 0) for _ in range(3)]
    bars = _build_daily_bars(checks, mid, days=7)
    today_bar = bars[-1]  # newest = last
    assert today_bar.date == datetime.now(UTC).date()
    assert today_bar.uptime_percentage == 0.0


def test_daily_bars_today_mixed() -> None:
    mid = uuid.uuid4()
    checks = [
        _make_check(mid, "up", 0),
        _make_check(mid, "down", 0),
    ]
    bars = _build_daily_bars(checks, mid, days=7)
    assert bars[-1].uptime_percentage == 50.0


# ── Avg response time ─────────────────────────────────────────────────────────


def test_avg_response_time_no_data() -> None:
    assert _compute_avg_response_time([], uuid.uuid4()) is None


def test_avg_response_time_excludes_none() -> None:
    mid = uuid.uuid4()
    checks = [
        _make_check(mid, "up", 0, response_time_ms=100),
        _make_check(mid, "down", 0, response_time_ms=None),
        _make_check(mid, "up", 0, response_time_ms=200),
    ]
    avg = _compute_avg_response_time(checks, mid)
    assert avg == 150.0


def test_avg_response_time_ignores_other_monitors() -> None:
    mid = uuid.uuid4()
    other = uuid.uuid4()
    checks = [
        _make_check(mid, "up", 0, response_time_ms=100),
        _make_check(other, "up", 0, response_time_ms=9999),
    ]
    assert _compute_avg_response_time(checks, mid) == 100.0
