"""Add consent tracking fields to users.

Revision ID: 002_user_consent_fields
Revises: 001_initial_schema
Create Date: 2026-03-12 14:30:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "002_user_consent_fields"
down_revision: str | None = "001_initial_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add consent-related columns on users."""

    op.add_column(
        "users",
        sa.Column("terms_accepted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("privacy_accepted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column(
            "marketing_consent",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
    op.add_column(
        "users",
        sa.Column("marketing_consent_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    """Drop consent-related columns from users."""

    op.drop_column("users", "marketing_consent_at")
    op.drop_column("users", "marketing_consent")
    op.drop_column("users", "privacy_accepted_at")
    op.drop_column("users", "terms_accepted_at")
