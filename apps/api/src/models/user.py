"""User-related models: users, sessions, OAuth identities."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import INET, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import AuditMixin, Base
from models.types import CIText

if TYPE_CHECKING:
    from models.admin import Admin
    from models.game_account import UserGameAccount
    from models.moderation import Report
    from models.review import Review
    from models.server import Server


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
    email_confirmed_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
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
    terms_accepted_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
    )
    privacy_accepted_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
    )
    marketing_consent: Mapped[bool] = mapped_column(
        nullable=False,
        default=False,
    )
    marketing_consent_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
    )
    last_login_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
    )

    # Relationships
    sessions: Mapped[list[UserSession]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    oauth_identities: Mapped[list[UserOAuthIdentity]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    servers: Mapped[list[Server]] = relationship(
        back_populates="owner",
    )
    reports_submitted: Mapped[list[Report]] = relationship(
        foreign_keys="[Report.reporter_user_id]",
        back_populates="reporter",
    )
    reports_resolved: Mapped[list[Report]] = relationship(
        foreign_keys="[Report.resolved_by_user_id]",
        back_populates="resolved_by",
    )
    reviews: Mapped[list[Review]] = relationship(
        back_populates="author",
    )
    game_accounts: Mapped[list[UserGameAccount]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    verification_tokens: Mapped[list[VerificationToken]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    admin_profile: Mapped[Admin | None] = relationship(
        foreign_keys="[Admin.user_id]",
        back_populates="user",
        uselist=False,
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'suspended', 'deleted')",
            name="chk_users_status",
        ),
        CheckConstraint(
            "locale IN ('en', 'tr', 'de', 'ru', 'es', 'fr')",
            name="chk_users_locale",
        ),
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
    user: Mapped[User] = relationship(back_populates="sessions")

    __table_args__ = (
        Index("idx_user_sessions_user_id", "user_id"),
        Index("idx_user_sessions_expires_at", "expires_at"),
        {"comment": "User sessions for refresh token rotation"},
    )


class UserOAuthIdentity(Base, AuditMixin):
    """OAuth provider linkage for users (social login: Google, Discord, GitHub)."""

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
    user: Mapped[User] = relationship(back_populates="oauth_identities")

    __table_args__ = (
        UniqueConstraint(
            "provider",
            "provider_user_id",
            name="uq_oauth_identity",
        ),
        {"comment": "OAuth provider identities linked to users"},
    )


class VerificationToken(Base, AuditMixin):
    """Secure tokens for email verification or password resets."""

    __tablename__ = "verification_tokens"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    token_hash: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    purpose: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="email_verification",
    )
    expires_at: Mapped[datetime] = mapped_column(
        nullable=False,
    )

    # Relationships
    user: Mapped[User] = relationship(back_populates="verification_tokens")

    __table_args__ = (
        Index("idx_verification_tokens_user_id", "user_id"),
        Index("idx_verification_tokens_token_hash", "token_hash", unique=True),
        CheckConstraint(
            "purpose IN ('email_verification', 'password_reset')",
            name="chk_verification_tokens_purpose",
        ),
        {"comment": "Secure tokens for sensitive account actions"},
    )
