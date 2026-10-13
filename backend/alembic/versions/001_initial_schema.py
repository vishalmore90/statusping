"""Initial schema: users, status_pages, monitors, check_results, incidents, incident_updates

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-13

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── users ──────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # ── status_pages ───────────────────────────────────────────────────────────
    op.create_table(
        "status_pages",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("slug", sa.String(100), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_status_pages_slug", "status_pages", ["slug"], unique=True)
    op.create_index("ix_status_pages_user_id", "status_pages", ["user_id"])

    # ── monitors ───────────────────────────────────────────────────────────────
    op.create_table(
        "monitors",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status_page_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column("monitor_type", sa.String(20), nullable=False, server_default="http"),
        sa.Column("interval_seconds", sa.Integer(), nullable=False, server_default="60"),
        sa.Column("timeout_seconds", sa.Integer(), nullable=False, server_default="10"),
        sa.Column("expected_status_code", sa.Integer(), nullable=True, server_default="200"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("current_status", sa.String(20), nullable=False, server_default="unknown"),
        sa.Column("last_checked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint("monitor_type IN ('http', 'tcp')", name="ck_monitor_type"),
        sa.CheckConstraint("interval_seconds >= 60", name="ck_interval_min"),
        sa.CheckConstraint(
            "current_status IN ('up', 'down', 'unknown')", name="ck_current_status"
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["status_page_id"], ["status_pages.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_monitors_user_id", "monitors", ["user_id"])
    op.create_index("ix_monitors_status_page_id", "monitors", ["status_page_id"])
    op.create_index(
        "ix_monitors_user_active", "monitors", ["user_id", "is_active"]
    )

    # ── check_results ──────────────────────────────────────────────────────────
    op.create_table(
        "check_results",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("monitor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "checked_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("status", sa.String(10), nullable=False),
        sa.Column("response_time_ms", sa.Integer(), nullable=True),
        sa.Column("status_code", sa.Integer(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.CheckConstraint("status IN ('up', 'down')", name="ck_check_status"),
        sa.ForeignKeyConstraint(["monitor_id"], ["monitors.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_check_results_monitor_id", "check_results", ["monitor_id"])
    op.create_index(
        "ix_check_results_monitor_time",
        "check_results",
        ["monitor_id", "checked_at"],
    )

    # ── incidents ──────────────────────────────────────────────────────────────
    op.create_table(
        "incidents",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status_page_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="investigating"),
        sa.Column("impact", sa.String(20), nullable=False, server_default="none"),
        sa.Column(
            "started_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "status IN ('investigating', 'identified', 'monitoring', 'resolved')",
            name="ck_incident_status",
        ),
        sa.CheckConstraint(
            "impact IN ('none', 'minor', 'major', 'critical')",
            name="ck_incident_impact",
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["status_page_id"], ["status_pages.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_incidents_user_id", "incidents", ["user_id"])
    op.create_index("ix_incidents_status_page_id", "incidents", ["status_page_id"])
    op.create_index(
        "ix_incidents_page_started", "incidents", ["status_page_id", "started_at"]
    )

    # ── incident_updates ───────────────────────────────────────────────────────
    op.create_table(
        "incident_updates",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("incident_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "status IN ('investigating', 'identified', 'monitoring', 'resolved')",
            name="ck_incident_update_status",
        ),
        sa.ForeignKeyConstraint(
            ["incident_id"], ["incidents.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_incident_updates_incident_id", "incident_updates", ["incident_id"]
    )
    op.create_index(
        "ix_incident_updates_incident_time",
        "incident_updates",
        ["incident_id", "created_at"],
    )


def downgrade() -> None:
    op.drop_table("incident_updates")
    op.drop_table("incidents")
    op.drop_table("check_results")
    op.drop_table("monitors")
    op.drop_table("status_pages")
    op.drop_table("users")
