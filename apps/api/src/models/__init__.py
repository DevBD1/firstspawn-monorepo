"""Database models for the FirstSpawn API.

This module exports all SQLAlchemy models for use in migrations and queries.
"""

from models.admin import Admin
from models.agent import ActionProposal, AgentRun, DecisionLog
from models.base import Base
from models.game_account import UserGameAccount
from models.moderation import Report
from models.plugin import PlaytimeEvent, PluginKey, ServerHeartbeat
from models.reputation import ServerReputationSnapshot
from models.review import Review, ReviewModerationAction, ReviewVote
from models.server import (
    Server,
    Tag,
    favorites,
    server_tags,
)
from models.server_platform import ServerPlatform
from models.user import User, UserOAuthIdentity, UserSession

__all__ = [
    "Base",
    # User models
    "User",
    "UserSession",
    "UserOAuthIdentity",
    "UserGameAccount",
    # Admin models
    "Admin",
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
