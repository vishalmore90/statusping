"""Add monitor_id to incidents table for auto-incident deduplication

Revision ID: 002_incident_monitor_id
Revises: 001_initial_schema
Create Date: 2026-10-13

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "002_incident_monitor_id"
down_revision: Union[str, None] = "001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "incidents",
        sa.Column(
            "monitor_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("monitors.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.create_index("ix_incidents_monitor_id", "incidents", ["monitor_id"])


def downgrade() -> None:
    op.drop_index("ix_incidents_monitor_id", table_name="incidents")
    op.drop_column("incidents", "monitor_id")
