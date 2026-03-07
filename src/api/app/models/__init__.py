"""Database models for the FirstSpawn API.

This module exports all SQLAlchemy models for use in migrations and queries.
"""

from app.models.agent import ActionProposal, AgentRun, DecisionLog
from app.models.base import Base
from app.models.moderation import Report
from app.models.plugin import PlaytimeEvent, PluginKey, ServerHeartbeat
from app.models.server import (
    Server,
    Tag,
    favorites,
    server_tags,
)
from app.models.user import User, UserOAuthIdentity, UserSession

__all__ = [
    "Base",
    # User models
    "User",
    "UserSession",
    "UserOAuthIdentity",
    # Server models
    "Server",
    "Tag",
    "server_tags",
    "favorites",
    # Plugin models
    "PluginKey",
    "ServerHeartbeat",
    "PlaytimeEvent",
    # Moderation models
    "Report",
    # Agent models
    "AgentRun",
    "ActionProposal",
    "DecisionLog",
]
