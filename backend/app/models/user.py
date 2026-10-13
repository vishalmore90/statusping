import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    monitors: Mapped[list["Monitor"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Monitor", back_populates="user", cascade="all, delete-orphan"
    )
    status_pages: Mapped[list["StatusPage"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "StatusPage", back_populates="user", cascade="all, delete-orphan"
    )
    incidents: Mapped[list["Incident"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Incident", back_populates="user", cascade="all, delete-orphan"
    )
