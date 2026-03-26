"""Review models: reviews, votes, and moderation actions."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    ForeignKey,
    Index,
    Integer,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import AuditMixin, Base

if TYPE_CHECKING:
    from models.server import Server
    from models.user import User


class Review(Base, AuditMixin):
    """User reviews on game servers."""

    __tablename__ = "reviews"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    server_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("servers.id", ondelete="CASCADE"),
        nullable=False,
    )
    author_user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    rating: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
    )
    title: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    body: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    is_verified: Mapped[bool] = mapped_column(
        nullable=False,
        default=False,
    )
    verified_playtime_seconds: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="published",
    )
    helpful_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    unhelpful_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    edited_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
    )
    deleted_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
    )

    # Relationships
    server: Mapped[Server] = relationship(back_populates="reviews")
    author: Mapped[User] = relationship(back_populates="reviews")
    votes: Mapped[list[ReviewVote]] = relationship(
        back_populates="review",
        cascade="all, delete-orphan",
    )
    moderation_actions: Mapped[list[ReviewModerationAction]] = relationship(
        back_populates="review",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        UniqueConstraint(
            "server_id",
            "author_user_id",
            name="uq_reviews_server_author",
        ),
        CheckConstraint(
            "rating >= 1 AND rating <= 5",
            name="chk_reviews_rating",
        ),
        CheckConstraint(
            "status IN ('published', 'hidden', 'removed')",
            name="chk_reviews_status",
        ),
        Index("idx_reviews_server_id", "server_id"),
        Index("idx_reviews_author_user_id", "author_user_id"),
        Index("idx_reviews_status_created", "status", "created_at"),
        {"comment": "User reviews on game servers"},
    )


class ReviewVote(Base):
    """Helpfulness votes on reviews."""

    __tablename__ = "review_votes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    review_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("reviews.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    is_helpful: Mapped[bool] = mapped_column(
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        nullable=False,
        server_default="now()",
    )

    # Relationships
    review: Mapped[Review] = relationship(back_populates="votes")

    __table_args__ = (
        UniqueConstraint(
            "review_id",
            "user_id",
            name="uq_review_votes_review_user",
        ),
        Index("idx_review_votes_review_id", "review_id"),
        {"comment": "Helpfulness votes on reviews"},
    )


class ReviewModerationAction(Base, AuditMixin):
    """Moderator actions on reviews (hide, remove, restore, flag)."""

    __tablename__ = "review_moderation_actions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    review_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("reviews.id", ondelete="CASCADE"),
        nullable=False,
    )
    moderator_user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    action: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Relationships
    review: Mapped[Review] = relationship(back_populates="moderation_actions")

    __table_args__ = (
        CheckConstraint(
            "action IN ('hide', 'remove', 'restore', 'flag')",
            name="chk_review_mod_action",
        ),
        Index("idx_review_mod_actions_review", "review_id"),
        {"comment": "Moderator actions on reviews"},
    )
