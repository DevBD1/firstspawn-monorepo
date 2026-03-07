"""Initial schema v1 - users, servers, plugins, moderation, agents

Revision ID: 001_initial_schema
Revises:
Create Date: 2026-03-07 22:15:00.000000

TODO: Future improvements to consider:
- Split into separate schemas: auth, discovery, plugin, agent
- Domain-by-domain migration strategy for better rollback granularity
- Add partial unique indexes for idempotency keys
- Add GIN index for PostgreSQL FTS search
- Add materialized views for reputation calculations (future phase)

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create all V1 schema tables."""

    # ============================================
    # Core Identity Tables
    # ============================================

    op.create_table(
        "users",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("email", sa.Text(), nullable=False, unique=True),
        sa.Column("username", sa.Text(), nullable=False, unique=True),
        sa.Column("password_hash", sa.Text(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("locale", sa.String(10), nullable=False, server_default="en"),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        comment="User accounts with authentication",
    )

    # Add check constraint for status
    op.create_check_constraint(
        "chk_users_status",
        "users",
        sa.text("status IN ('active', 'suspended', 'deleted')"),
    )

    op.create_table(
        "user_sessions",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("refresh_token_hash", sa.Text(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ip", postgresql.INET(), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        comment="User sessions for refresh token rotation",
    )

    op.create_index("idx_user_sessions_user_id", "user_sessions", ["user_id"])
    op.create_index("idx_user_sessions_expires_at", "user_sessions", ["expires_at"])

    op.create_table(
        "user_oauth_identities",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("provider", sa.String(50), nullable=False),
        sa.Column("provider_user_id", sa.String(255), nullable=False),
        sa.Column("provider_email", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint("provider", "provider_user_id", name="uq_oauth_identity"),
        comment="OAuth provider identities linked to users",
    )

    # ============================================
    # Discovery Tables
    # ============================================

    op.create_table(
        "servers",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "owner_user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("slug", sa.Text(), nullable=False, unique=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("game", sa.String(20), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="draft"),
        sa.Column("website_url", sa.Text(), nullable=True),
        sa.Column("discord_url", sa.Text(), nullable=True),
        sa.Column("ip_or_host", sa.Text(), nullable=False),
        sa.Column("port", sa.Integer(), nullable=False),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("last_seen_online_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        comment="Game server listings",
    )

    op.create_check_constraint(
        "chk_servers_game",
        "servers",
        sa.text("game IN ('minecraft', 'hytale')"),
    )
    op.create_check_constraint(
        "chk_servers_status",
        "servers",
        sa.text("status IN ('draft', 'active', 'archived')"),
    )
    op.create_index("idx_servers_game_status", "servers", ["game", "status"])
    op.create_index("idx_servers_last_seen_online_at", "servers", ["last_seen_online_at"])

    op.create_table(
        "tags",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("slug", sa.Text(), nullable=False, unique=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        comment="Tags for server categorization",
    )

    op.create_table(
        "server_tags",
        sa.Column(
            "server_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("servers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "tag_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tags.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("server_id", "tag_id"),
        comment="Server-tag associations",
    )

    op.create_table(
        "favorites",
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "server_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("servers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("user_id", "server_id"),
        comment="User favorite servers",
    )
    op.create_index("idx_favorites_server_id", "favorites", ["server_id"])

    # ============================================
    # Plugin Verification Tables
    # ============================================

    op.create_table(
        "plugin_keys",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "server_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("servers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("key_id", sa.Text(), nullable=False, unique=True),
        sa.Column("secret_hash", sa.Text(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        comment="Plugin API keys for server authentication",
    )

    op.create_check_constraint(
        "chk_plugin_keys_status",
        "plugin_keys",
        sa.text("status IN ('active', 'revoked')"),
    )

    op.create_table(
        "server_heartbeats",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "server_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("servers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "plugin_key_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("plugin_keys.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("uptime_seconds", sa.Integer(), nullable=True),
        sa.Column("online_players", sa.Integer(), nullable=True),
        sa.Column("payload", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("idempotency_key", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        comment="Server heartbeat telemetry events",
    )

    op.create_index(
        "idx_server_heartbeats_server_occurred", "server_heartbeats", ["server_id", "occurred_at"]
    )
    # TODO: Add partial unique index for idempotency
    # op.create_index("idx_server_heartbeats_idempotency", "server_heartbeats", ["plugin_key_id", "idempotency_key"],
    #                 unique=True, postgresql_where=sa.text("idempotency_key IS NOT NULL"))

    op.create_table(
        "playtime_events",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "server_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("servers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "plugin_key_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("plugin_keys.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("external_player_id", sa.Text(), nullable=False),
        sa.Column("event_type", sa.String(20), nullable=False),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("payload", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("idempotency_key", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        comment="Player playtime events",
    )

    op.create_check_constraint(
        "chk_playtime_events_type",
        "playtime_events",
        sa.text("event_type IN ('join', 'leave', 'session')"),
    )
    op.create_index(
        "idx_playtime_events_server_occurred", "playtime_events", ["server_id", "occurred_at"]
    )
    op.create_index(
        "idx_playtime_events_external_player", "playtime_events", ["external_player_id"]
    )
    # TODO: Add partial unique index for idempotency
    # op.create_index("idx_playtime_events_idempotency", "playtime_events", ["plugin_key_id", "idempotency_key"],
    #                 unique=True, postgresql_where=sa.text("idempotency_key IS NOT NULL"))

    # ============================================
    # Moderation Tables
    # ============================================

    op.create_table(
        "reports",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "reporter_user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("target_type", sa.String(20), nullable=False),
        sa.Column("target_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("reason_code", sa.String(50), nullable=False),
        sa.Column("details", sa.Text(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="open"),
        sa.Column(
            "resolved_by_user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        comment="User reports for moderation",
    )

    op.create_check_constraint(
        "chk_reports_target_type",
        "reports",
        sa.text("target_type IN ('server', 'user', 'content')"),
    )
    op.create_check_constraint(
        "chk_reports_status",
        "reports",
        sa.text("status IN ('open', 'triaged', 'resolved', 'dismissed')"),
    )
    op.create_index("idx_reports_target", "reports", ["target_type", "target_id"])
    op.create_index("idx_reports_status_created", "reports", ["status", "created_at"])

    # ============================================
    # Agentic Audit Tables
    # ============================================

    op.create_table(
        "agent_runs",
        sa.Column(
            "run_id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("agent_id", sa.String(100), nullable=False),
        sa.Column("pod", sa.String(100), nullable=False),
        sa.Column("task_type", sa.String(100), nullable=False),
        sa.Column("status", sa.String(50), nullable=False),
        sa.Column("confidence", sa.Numeric(4, 3), nullable=True),
        sa.Column("risk_class", sa.String(50), nullable=False),
        sa.Column("input_ref", sa.Text(), nullable=True),
        sa.Column("output_summary", sa.Text(), nullable=True),
        sa.Column("evidence_ref", sa.Text(), nullable=True),
        sa.Column("rollback_ref", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        comment="Audit log for autonomous agent executions",
    )

    op.create_table(
        "action_proposals",
        sa.Column(
            "proposal_id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "run_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("agent_runs.run_id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("action_type", sa.String(100), nullable=False),
        sa.Column("target_system", sa.String(100), nullable=False),
        sa.Column("target_ref", sa.Text(), nullable=True),
        sa.Column("policy_decision", sa.String(50), nullable=False),
        sa.Column("required_approver_role", sa.String(100), nullable=True),
        sa.Column("estimated_impact", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("max_blast_radius", sa.String(50), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        comment="Proposed actions by autonomous agents",
    )

    op.create_check_constraint(
        "chk_action_proposals_decision",
        "action_proposals",
        sa.text("policy_decision IN ('allow', 'deny', 'needs_approval')"),
    )

    op.create_table(
        "decision_logs",
        sa.Column(
            "decision_id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "proposal_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("action_proposals.proposal_id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("human_approver", sa.String(255), nullable=True),
        sa.Column("decision", sa.String(50), nullable=False),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("executed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("result_status", sa.String(50), nullable=True),
        sa.Column("result_metrics", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("incident_flag", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        comment="Decision audit log for action proposals",
    )

    op.create_check_constraint(
        "chk_decision_logs_decision",
        "decision_logs",
        sa.text("decision IN ('approved', 'denied', 'auto_allowed', 'auto_denied')"),
    )


def downgrade() -> None:
    """Drop all V1 schema tables in reverse order."""

    # Agentic tables
    op.drop_table("decision_logs")
    op.drop_table("action_proposals")
    op.drop_table("agent_runs")

    # Moderation tables
    op.drop_table("reports")

    # Plugin tables
    op.drop_table("playtime_events")
    op.drop_table("server_heartbeats")
    op.drop_table("plugin_keys")

    # Discovery tables
    op.drop_table("favorites")
    op.drop_table("server_tags")
    op.drop_table("tags")
    op.drop_table("servers")

    # Identity tables
    op.drop_table("user_oauth_identities")
    op.drop_table("user_sessions")
    op.drop_table("users")
