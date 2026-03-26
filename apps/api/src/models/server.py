"""Discovery models: servers, tags, favorites, and search."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    PrimaryKeyConstraint,
    String,
    Table,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import TSVECTOR, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import AuditMixin, Base
from models.types import CIText

if TYPE_CHECKING:
    from models.plugin import PlaytimeEvent, PluginKey, ServerHeartbeat
    from models.reputation import ServerReputationSnapshot
    from models.review import Review
    from models.server_platform import ServerPlatform
    from models.user import User


# Association table: servers <-> tags
server_tags = Table(
    "server_tags",
    Base.metadata,
    Column(
        "server_id",
        UUID(as_uuid=True),
        ForeignKey("servers.id", ondelete="CASCADE"),
        nullable=False,
    ),
    Column(
        "tag_id",
        UUID(as_uuid=True),
        ForeignKey("tags.id", ondelete="CASCADE"),
        nullable=False,
    ),
    Column(
        "created_at",
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    ),
    PrimaryKeyConstraint("server_id", "tag_id"),
)


# Association table: users <-> favorites
favorites = Table(
    "favorites",
    Base.metadata,
    Column(
        "user_id",
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    ),
    Column(
        "server_id",
        UUID(as_uuid=True),
        ForeignKey("servers.id", ondelete="CASCADE"),
        nullable=False,
    ),
    Column(
        "created_at",
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    ),
    PrimaryKeyConstraint("user_id", "server_id"),
)


class Server(Base, AuditMixin):
    """Game server listings."""

    __tablename__ = "servers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    owner_user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    slug: Mapped[str] = mapped_column(
        CIText,
        unique=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    game: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="draft",
    )
    website_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    discord_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    ip_or_host: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    port: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    is_verified: Mapped[bool] = mapped_column(
        nullable=False,
        default=False,
    )
    search_vector: Mapped[str | None] = mapped_column(
        TSVECTOR,
        nullable=True,
    )
    last_seen_online_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
    )
    deleted_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
    )

    # Relationships
    owner: Mapped[User | None] = relationship(back_populates="servers")
    tags: Mapped[list[Tag]] = relationship(
        secondary=server_tags,
        back_populates="servers",
    )
    platforms: Mapped[list[ServerPlatform]] = relationship(
        back_populates="server",
        cascade="all, delete-orphan",
    )
    plugin_keys: Mapped[list[PluginKey]] = relationship(
        back_populates="server",
    )
    heartbeats: Mapped[list[ServerHeartbeat]] = relationship(
        back_populates="server",
    )
    playtime_events: Mapped[list[PlaytimeEvent]] = relationship(
        back_populates="server",
    )
    reviews: Mapped[list[Review]] = relationship(
        back_populates="server",
    )
    reputation_snapshots: Mapped[list[ServerReputationSnapshot]] = relationship(
        back_populates="server",
    )

    __table_args__ = (
        CheckConstraint(
            "game IN ('minecraft', 'hytale')",
            name="chk_servers_game",
        ),
        CheckConstraint(
            "status IN ('draft', 'active', 'archived')",
            name="chk_servers_status",
        ),
        Index("idx_servers_game_status", "game", "status"),
        Index("idx_servers_last_seen_online_at", "last_seen_online_at"),
        Index(
            "idx_servers_search_vector",
            "search_vector",
            postgresql_using="gin",
        ),
        {"comment": "Game server listings"},
    )


class Tag(Base, AuditMixin):
    """Tags for categorizing servers."""

    __tablename__ = "tags"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    slug: Mapped[str] = mapped_column(
        CIText,
        unique=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # Relationships
    servers: Mapped[list[Server]] = relationship(
        secondary=server_tags,
        back_populates="tags",
    )

    __table_args__ = ({"comment": "Tags for server categorization"},)
