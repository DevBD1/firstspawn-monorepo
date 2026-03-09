"""Database models for the FirstSpawn API.

This module exports all SQLAlchemy models for use in migrations and queries.
"""

from app.models.agent import ActionProposal, AgentRun, DecisionLog
from app.models.base import Base
from app.models.game_account import UserGameAccount
from app.models.moderation import Report
from app.models.plugin import PlaytimeEvent, PluginKey, ServerHeartbeat
from app.models.reputation import ServerReputationSnapshot
from app.models.review import Review, ReviewModerationAction, ReviewVote
from app.models.server import (
    Server,
    Tag,
    favorites,
    server_tags,
)
from app.models.server_platform import ServerPlatform
from app.models.user import User, UserOAuthIdentity, UserSession

__all__ = [
    "Base",
    # User models
    "User",
    "UserSession",
    "UserOAuthIdentity",
    "UserGameAccount",
    # Server models
    "Server",
    "Tag",
    "server_tags",
    "favorites",
    "ServerPlatform",
    # Plugin models
    "PluginKey",
    "ServerHeartbeat",
    "PlaytimeEvent",
    # Review models
    "Review",
    "ReviewVote",
    "ReviewModerationAction",
    # Reputation models
    "ServerReputationSnapshot",
    # Moderation models
    "Report",
    # Agent models
    "AgentRun",
    "ActionProposal",
    "DecisionLog",
]
