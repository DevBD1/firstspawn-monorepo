"""Moderation models: reports and actions."""

import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import AuditMixin, Base


class Report(Base, AuditMixin):
    """User-submitted reports for moderation."""

    __tablename__ = "reports"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    reporter_user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    target_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    target_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    reason_code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    details: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="open",
    )
    resolved_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    resolved_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
    )

    # Relationships
    reporter: Mapped["User | None"] = relationship(
        foreign_keys=[reporter_user_id],
        back_populates="reports_submitted",
    )
    resolved_by: Mapped["User | None"] = relationship(
        foreign_keys=[resolved_by_user_id],
        back_populates="reports_resolved",
    )

    __table_args__ = (
        Index("idx_reports_target", "target_type", "target_id"),
        Index("idx_reports_status_created", "status", "created_at"),
        {"comment": "User reports for moderation"},
    )
