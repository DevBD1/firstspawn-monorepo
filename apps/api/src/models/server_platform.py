"""Server platform models: Minecraft edition support (Java, Bedrock, Pocket)."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    PrimaryKeyConstraint,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base

if TYPE_CHECKING:
    from models.server import Server


class ServerPlatform(Base):
    """Platform/edition support for a game server.

    Primarily for Minecraft servers which can support Java Edition,
    Bedrock Edition, and/or Pocket Edition. A server can support
    multiple platforms simultaneously.
    """

    __tablename__ = "server_platforms"

    server_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("servers.id", ondelete="CASCADE"),
        nullable=False,
    )
    platform: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    server: Mapped[Server] = relationship(back_populates="platforms")

    __table_args__ = (
        PrimaryKeyConstraint("server_id", "platform"),
        CheckConstraint(
            "platform IN ('java', 'bedrock', 'pocket')",
            name="chk_server_platform",
        ),
        {"comment": "Platform/edition support for game servers"},
    )
