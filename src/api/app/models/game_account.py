"""Game account models: Mojang and Hytale identity linking."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import AuditMixin, Base

if TYPE_CHECKING:
    from app.models.user import User


class UserGameAccount(Base, AuditMixin):
    """Linked game accounts for identity verification (Mojang, Hytale).

    Separate from social OAuth (Google/Discord/GitHub) which is used for login.
    Game accounts are used for trust verification and playtime linkage.
    """

    __tablename__ = "user_game_accounts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    platform: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    platform_user_id: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    platform_username: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    verified_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
    )
    token_expires_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
    )

    # Relationships
    user: Mapped[User] = relationship(back_populates="game_accounts")

    __table_args__ = (
        UniqueConstraint(
            "platform",
            "platform_user_id",
            name="uq_game_account_platform_id",
        ),
        CheckConstraint(
            "platform IN ('mojang', 'hytale')",
            name="chk_game_account_platform",
        ),
        Index("idx_game_accounts_user_id", "user_id"),
        {"comment": "Linked game accounts for identity verification"},
    )
