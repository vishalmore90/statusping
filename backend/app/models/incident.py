import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

INCIDENT_STATUSES = ("investigating", "identified", "monitoring", "resolved")
INCIDENT_IMPACTS = ("none", "minor", "major", "critical")


class Incident(Base):
    __tablename__ = "incidents"
    __table_args__ = (
        CheckConstraint(f"status IN {INCIDENT_STATUSES}", name="ck_incident_status"),
        CheckConstraint(f"impact IN {INCIDENT_IMPACTS}", name="ck_incident_impact"),
        Index("ix_incidents_page_started", "status_page_id", "started_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status_page_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("status_pages.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    monitor_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("monitors.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="investigating")
    impact: Mapped[str] = mapped_column(String(20), nullable=False, default="none")
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="incidents")  # type: ignore[name-defined]  # noqa: F821
    status_page: Mapped["StatusPage | None"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "StatusPage", back_populates="incidents"
    )
    updates: Mapped[list["IncidentUpdate"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "IncidentUpdate",
        back_populates="incident",
        cascade="all, delete-orphan",
        order_by="IncidentUpdate.created_at.desc()",
    )
