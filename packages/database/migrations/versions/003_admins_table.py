"""Schema V3 — dedicated admins table

Revision ID: 003_admins_table
Revises: 002_schema_v2
Create Date: 2026-03-18 20:55:00.000000

Changes:
- Create admins table (role, granted_by, is_active, notes)
- Unique constraint on user_id (1:1 with users)
- CHECK constraint on role enum
- Composite index on (role, is_active)

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "003_admins_table"
down_revision: str | tuple[str, ...] = ("002_schema_v2", "002_user_consent_fields")
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create the admins table."""

    op.create_table(
        "admins",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            unique=True,
            nullable=False,
        ),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column(
            "granted_by_user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default="true",
        ),
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
        sa.UniqueConstraint("user_id", name="uq_admins_user_id"),
        comment="Dedicated admin accounts linked to users",
    )
    op.create_check_constraint(
        "chk_admins_role",
        "admins",
        sa.text("role IN ('moderator', 'analyst', 'admin', 'super_admin')"),
    )
    op.create_index("idx_admins_role_active", "admins", ["role", "is_active"])


def downgrade() -> None:
    """Drop the admins table."""
    op.drop_table("admins")
