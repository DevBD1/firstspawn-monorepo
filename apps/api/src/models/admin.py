"""Admin models: dedicated admin accounts linked to users."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import AuditMixin, Base

if TYPE_CHECKING:
    from models.user import User


class Admin(Base, AuditMixin):
    """Dedicated admin record linked 1:1 to a user account.

    Stores role, activation status, and an audit trail of who granted
    admin privileges. A user without a corresponding Admin row is a
    regular (non-admin) user.
    """

    __tablename__ = "admins"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    granted_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    is_active: Mapped[bool] = mapped_column(
        nullable=False,
        default=True,
    )

    # Relationships
    user: Mapped[User] = relationship(
        foreign_keys=[user_id],
        back_populates="admin_profile",
    )
    granted_by: Mapped[User | None] = relationship(
        foreign_keys=[granted_by_user_id],
    )

    __table_args__ = (
        UniqueConstraint("user_id", name="uq_admins_user_id"),
        CheckConstraint(
            "role IN ('moderator', 'analyst', 'admin', 'super_admin')",
            name="chk_admins_role",
        ),
        Index("idx_admins_role_active", "role", "is_active"),
        {"comment": "Dedicated admin accounts linked to users"},
    )
