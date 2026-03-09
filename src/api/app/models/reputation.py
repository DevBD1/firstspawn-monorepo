"""Reputation models: server trust score snapshots."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Date, Index, Integer, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.server import Server

from sqlalchemy import ForeignKey


class ServerReputationSnapshot(Base):
    """Daily materialized reputation scores for servers."""

    __tablename__ = "server_reputation_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    server_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("servers.id", ondelete="CASCADE"),
        nullable=False,
    )
    snapshot_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )
    avg_rating: Mapped[Decimal | None] = mapped_column(
        Numeric(3, 2),
        nullable=True,
    )
    review_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    verified_review_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    favorite_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    heartbeat_uptime_pct: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )
    avg_online_players: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )
    total_playtime_seconds: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )
    trust_score: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 3),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        nullable=False,
        server_default="now()",
    )

    # Relationships
    server: Mapped[Server] = relationship(back_populates="reputation_snapshots")

    __table_args__ = (
        UniqueConstraint(
            "server_id",
            "snapshot_date",
            name="uq_reputation_server_date",
        ),
        Index(
            "idx_reputation_server_date",
            "server_id",
            snapshot_date.desc(),
        ),
        Index(
            "idx_reputation_trust_score",
            trust_score.desc(),
        ),
        {"comment": "Daily materialized reputation scores for servers"},
    )
