import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Monitor(Base):
    __tablename__ = "monitors"
    __table_args__ = (
        CheckConstraint("monitor_type IN ('http', 'tcp')", name="ck_monitor_type"),
        CheckConstraint("interval_seconds >= 60", name="ck_interval_min"),
        CheckConstraint("current_status IN ('up', 'down', 'unknown')", name="ck_current_status"),
        Index("ix_monitors_user_active", "user_id", "is_active"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status_page_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("status_pages.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    monitor_type: Mapped[str] = mapped_column(String(20), nullable=False, default="http")
    interval_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=60)
    timeout_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    expected_status_code: Mapped[int | None] = mapped_column(Integer, nullable=True, default=200)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    current_status: Mapped[str] = mapped_column(String(20), nullable=False, default="unknown")
    last_checked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="monitors")  # type: ignore[name-defined]  # noqa: F821
    status_page: Mapped["StatusPage | None"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "StatusPage", back_populates="monitors"
    )
    check_results: Mapped[list["CheckResult"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "CheckResult", back_populates="monitor", cascade="all, delete-orphan"
    )
