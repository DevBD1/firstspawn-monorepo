"""Plugin verification and telemetry models."""

import uuid
from datetime import datetime

from sqlalchemy import (
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import AuditMixin, Base


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
    server: Mapped["Server"] = relationship("Server", back_populates="plugin_keys")
    heartbeats: Mapped[list["ServerHeartbeat"]] = relationship(
        back_populates="plugin_key",
        cascade="all, delete-orphan",
    )
    playtime_events: Mapped[list["PlaytimeEvent"]] = relationship(
        back_populates="plugin_key",
        cascade="all, delete-orphan",
    )

    __table_args__ = ({"comment": "Plugin API keys for server authentication"},)


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
    plugin_key: Mapped["PluginKey"] = relationship(back_populates="heartbeats")
    server: Mapped["Server"] = relationship(back_populates="heartbeats")

    __table_args__ = (
        Index("idx_server_heartbeats_server_occurred", "server_id", "occurred_at"),
        # TODO: Add partial unique index for idempotency
        # unique partial (plugin_key_id, idempotency_key) where idempotency_key is not null
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
    plugin_key: Mapped["PluginKey"] = relationship(back_populates="playtime_events")
    server: Mapped["Server"] = relationship(back_populates="playtime_events")

    __table_args__ = (
        Index("idx_playtime_events_server_occurred", "server_id", "occurred_at"),
        Index("idx_playtime_events_external_player", "external_player_id"),
        # TODO: Add partial unique index for idempotency
        # unique partial (plugin_key_id, idempotency_key) where idempotency_key is not null
        {"comment": "Player playtime events"},
    )
