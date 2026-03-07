"""Discovery models: servers, tags, favorites, and search."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
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

from app.models.types import CIText
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import AuditMixin, Base

if TYPE_CHECKING:
    from app.models.user import User


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
    last_seen_online_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
    )
    deleted_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
    )

    # Relationships
    owner: Mapped["User | None"] = relationship(back_populates="servers")
    tags: Mapped[list["Tag"]] = relationship(
        secondary=server_tags,
        back_populates="servers",
    )

    __table_args__ = (
        Index("idx_servers_game_status", "game", "status"),
        Index("idx_servers_last_seen_online_at", "last_seen_online_at"),
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
    servers: Mapped[list["Server"]] = relationship(
        secondary=server_tags,
        back_populates="tags",
    )

    __table_args__ = ({"comment": "Tags for server categorization"},)
