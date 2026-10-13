import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

INCIDENT_STATUSES = ("investigating", "identified", "monitoring", "resolved")


class IncidentUpdate(Base):
    __tablename__ = "incident_updates"
    __table_args__ = (
        CheckConstraint(
            f"status IN {INCIDENT_STATUSES}", name="ck_incident_update_status"
        ),
        Index("ix_incident_updates_incident_time", "incident_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    incident_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("incidents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    incident: Mapped["Incident"] = relationship("Incident", back_populates="updates")  # type: ignore[name-defined]  # noqa: F821
