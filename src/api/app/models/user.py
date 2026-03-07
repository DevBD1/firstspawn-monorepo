"""User-related models: users, sessions, OAuth identities."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, String, Text

from app.models.types import CIText
from sqlalchemy.dialects.postgresql import INET, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import AuditMixin, Base

if TYPE_CHECKING:
    from app.models.server import Server


class User(Base, AuditMixin):
    """User account with authentication details."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    email: Mapped[str] = mapped_column(
        CIText,
        unique=True,
        nullable=False,
    )
    username: Mapped[str] = mapped_column(
        CIText,
        unique=True,
        nullable=False,
    )
    password_hash: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
    )
    locale: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="en",
    )
    last_login_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
    )

    # Relationships
    sessions: Mapped[list["UserSession"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    oauth_identities: Mapped[list["UserOAuthIdentity"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    servers: Mapped[list["Server"]] = relationship(
        back_populates="owner",
    )

    __table_args__ = (
        # Named constraints for clarity
        {"comment": "User accounts with authentication"},
    )


class UserSession(Base, AuditMixin):
    """User session for JWT refresh token rotation."""

    __tablename__ = "user_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    refresh_token_hash: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    expires_at: Mapped[datetime] = mapped_column(
        nullable=False,
    )
    revoked_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
    )
    ip: Mapped[str | None] = mapped_column(
        INET,
        nullable=True,
    )
    user_agent: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="sessions")

    __table_args__ = (
        Index("idx_user_sessions_user_id", "user_id"),
        Index("idx_user_sessions_expires_at", "expires_at"),
        {"comment": "User sessions for refresh token rotation"},
    )


class UserOAuthIdentity(Base, AuditMixin):
    """OAuth provider linkage for users."""

    __tablename__ = "user_oauth_identities"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    provider: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    provider_user_id: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    provider_email: Mapped[str | None] = mapped_column(
        CIText,
        nullable=True,
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="oauth_identities")

    __table_args__ = (
        # Unique constraint: one OAuth identity per provider per user
        {"comment": "OAuth provider identities linked to users"},
    )
