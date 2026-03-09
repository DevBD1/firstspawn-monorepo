"""Plugin verification and telemetry models."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import AuditMixin, Base

if TYPE_CHECKING:
    from app.models.server import Server


class PluginKey(Base, AuditMixin):
    """API keys for server plugin authentication."""

    __tablename__ = "plugin_keys"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    server_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("servers.id", ondelete="CASCADE"),
        nullable=False,
    )
    key_id: Mapped[str] = mapped_column(
        Text,
        unique=True,
        nullable=False,
    )
    secret_hash: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
    )
    last_used_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
    )
    expires_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
    )

    # Relationships
    server: Mapped[Server] = relationship("Server", back_populates="plugin_keys")
    heartbeats: Mapped[list[ServerHeartbeat]] = relationship(
        back_populates="plugin_key",
        cascade="all, delete-orphan",
    )
    playtime_events: Mapped[list[PlaytimeEvent]] = relationship(
        back_populates="plugin_key",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'revoked')",
            name="chk_plugin_keys_status",
        ),
        {"comment": "Plugin API keys for server authentication"},
    )


class ServerHeartbeat(Base, AuditMixin):
    """Server heartbeat telemetry from plugins."""

    __tablename__ = "server_heartbeats"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    server_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("servers.id", ondelete="CASCADE"),
        nullable=False,
    )
    plugin_key_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("plugin_keys.id", ondelete="CASCADE"),
        nullable=False,
    )
    occurred_at: Mapped[datetime] = mapped_column(
        nullable=False,
    )
    uptime_seconds: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )
    online_players: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )
    payload: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )
    idempotency_key: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Relationships
    plugin_key: Mapped[PluginKey] = relationship(back_populates="heartbeats")
    server: Mapped[Server] = relationship(back_populates="heartbeats")

    __table_args__ = (
        Index("idx_server_heartbeats_server_occurred", "server_id", "occurred_at"),
        Index(
            "idx_server_heartbeats_idempotency",
            "plugin_key_id",
            "idempotency_key",
            unique=True,
            postgresql_where="idempotency_key IS NOT NULL",
        ),
        {"comment": "Server heartbeat telemetry events"},
    )


class PlaytimeEvent(Base, AuditMixin):
    """Player join/leave/session events from plugins."""

    __tablename__ = "playtime_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    server_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("servers.id", ondelete="CASCADE"),
        nullable=False,
    )
    plugin_key_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("plugin_keys.id", ondelete="CASCADE"),
        nullable=False,
    )
    external_player_id: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    event_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    duration_seconds: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )
    occurred_at: Mapped[datetime] = mapped_column(
        nullable=False,
    )
    payload: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )
    idempotency_key: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Relationships
    plugin_key: Mapped[PluginKey] = relationship(back_populates="playtime_events")
    server: Mapped[Server] = relationship(back_populates="playtime_events")

    __table_args__ = (
        CheckConstraint(
            "event_type IN ('join', 'leave', 'session')",
            name="chk_playtime_events_type",
        ),
        Index("idx_playtime_events_server_occurred", "server_id", "occurred_at"),
        Index("idx_playtime_events_external_player", "external_player_id"),
        Index(
            "idx_playtime_events_idempotency",
            "plugin_key_id",
            "idempotency_key",
            unique=True,
            postgresql_where="idempotency_key IS NOT NULL",
        ),
        {"comment": "Player playtime events"},
    )
