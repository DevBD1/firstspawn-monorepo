"""Schema V2 — fixes, FTS, reviews, reputation, game accounts, platforms

Revision ID: 002_schema_v2
Revises: 001_initial_schema
Create Date: 2026-03-09 21:30:00.000000

Changes:
- Add search_vector (tsvector) + GIN index + auto-update trigger on servers
- Add partial unique indexes for idempotency on server_heartbeats / playtime_events
- Add CHECK constraint for users.locale
- Update reports.target_type CHECK to include 'review'
- Create server_platforms table (Minecraft editions: java, bedrock, pocket)
- Create user_game_accounts table (Mojang, Hytale identity linking)
- Create reviews table (1 per user per server, 1-5 rating, verified flag)
- Create review_votes table (helpfulness voting)
- Create review_moderation_actions table (moderator actions on reviews)
- Create server_reputation_snapshots table (daily materialized trust scores)

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "002_schema_v2"
down_revision: str = "001_initial_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Apply V2 schema changes."""

    # ============================================
    # Fixes to existing tables
    # ============================================

    # 1. Add search_vector column to servers
    op.add_column(
        "servers",
        sa.Column("search_vector", postgresql.TSVECTOR(), nullable=True),
    )
    op.create_index(
        "idx_servers_search_vector",
        "servers",
        ["search_vector"],
        postgresql_using="gin",
    )

    # Create trigger function to auto-update search_vector
    op.execute("""
        CREATE OR REPLACE FUNCTION servers_search_vector_update()
        RETURNS trigger AS $$
        BEGIN
            NEW.search_vector :=
                setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
                setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    op.execute("""
        CREATE TRIGGER trg_servers_search_vector_update
        BEFORE INSERT OR UPDATE OF name, description ON servers
        FOR EACH ROW
        EXECUTE FUNCTION servers_search_vector_update();
    """)

    # Backfill search_vector for existing rows
    op.execute("""
        UPDATE servers SET search_vector =
            setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(description, '')), 'B');
    """)

    # 2. Add partial unique indexes for idempotency
    op.create_index(
        "idx_server_heartbeats_idempotency",
        "server_heartbeats",
        ["plugin_key_id", "idempotency_key"],
        unique=True,
        postgresql_where=sa.text("idempotency_key IS NOT NULL"),
    )
    op.create_index(
        "idx_playtime_events_idempotency",
        "playtime_events",
        ["plugin_key_id", "idempotency_key"],
        unique=True,
        postgresql_where=sa.text("idempotency_key IS NOT NULL"),
    )

    # 3. Add CHECK constraint for users.locale
    op.create_check_constraint(
        "chk_users_locale",
        "users",
        sa.text("locale IN ('en', 'tr', 'de', 'ru', 'es', 'fr')"),
    )

    # 4. Update reports.target_type CHECK to include 'review'
    op.drop_constraint("chk_reports_target_type", "reports", type_="check")
    op.create_check_constraint(
        "chk_reports_target_type",
        "reports",
        sa.text("target_type IN ('server', 'user', 'content', 'review')"),
    )

    # ============================================
    # New table: server_platforms
    # ============================================

    op.create_table(
        "server_platforms",
        sa.Column(
            "server_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("servers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("platform", sa.String(20), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("server_id", "platform"),
        comment="Platform/edition support for game servers",
    )
    op.create_check_constraint(
        "chk_server_platform",
        "server_platforms",
        sa.text("platform IN ('java', 'bedrock', 'pocket')"),
    )

    # ============================================
    # New table: user_game_accounts
    # ============================================

    op.create_table(
        "user_game_accounts",
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
        sa.Column("platform", sa.String(20), nullable=False),
        sa.Column("platform_user_id", sa.Text(), nullable=False),
        sa.Column("platform_username", sa.Text(), nullable=True),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("token_expires_at", sa.DateTime(timezone=True), nullable=True),
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
        sa.UniqueConstraint(
            "platform", "platform_user_id", name="uq_game_account_platform_id"
        ),
        comment="Linked game accounts for identity verification",
    )
    op.create_check_constraint(
        "chk_game_account_platform",
        "user_game_accounts",
        sa.text("platform IN ('mojang', 'hytale')"),
    )
    op.create_index(
        "idx_game_accounts_user_id", "user_game_accounts", ["user_id"]
    )

    # ============================================
    # New table: reviews
    # ============================================

    op.create_table(
        "reviews",
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
            "author_user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("rating", sa.SmallInteger(), nullable=False),
        sa.Column("title", sa.Text(), nullable=True),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column(
            "is_verified", sa.Boolean(), nullable=False, server_default="false"
        ),
        sa.Column("verified_playtime_seconds", sa.Integer(), nullable=True),
        sa.Column(
            "status",
            sa.String(20),
            nullable=False,
            server_default="published",
        ),
        sa.Column(
            "helpful_count",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "unhelpful_count",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
        sa.Column("edited_at", sa.DateTime(timezone=True), nullable=True),
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
        sa.UniqueConstraint(
            "server_id", "author_user_id", name="uq_reviews_server_author"
        ),
        comment="User reviews on game servers",
    )
    op.create_check_constraint(
        "chk_reviews_rating",
        "reviews",
        sa.text("rating >= 1 AND rating <= 5"),
    )
    op.create_check_constraint(
        "chk_reviews_status",
        "reviews",
        sa.text("status IN ('published', 'hidden', 'removed')"),
    )
    op.create_index("idx_reviews_server_id", "reviews", ["server_id"])
    op.create_index("idx_reviews_author_user_id", "reviews", ["author_user_id"])
    op.create_index(
        "idx_reviews_status_created", "reviews", ["status", "created_at"]
    )

    # ============================================
    # New table: review_votes
    # ============================================

    op.create_table(
        "review_votes",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "review_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("reviews.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("is_helpful", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "review_id", "user_id", name="uq_review_votes_review_user"
        ),
        comment="Helpfulness votes on reviews",
    )
    op.create_index(
        "idx_review_votes_review_id", "review_votes", ["review_id"]
    )

    # ============================================
    # New table: review_moderation_actions
    # ============================================

    op.create_table(
        "review_moderation_actions",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "review_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("reviews.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "moderator_user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("action", sa.String(20), nullable=False),
        sa.Column("reason", sa.Text(), nullable=True),
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
        comment="Moderator actions on reviews",
    )
    op.create_check_constraint(
        "chk_review_mod_action",
        "review_moderation_actions",
        sa.text("action IN ('hide', 'remove', 'restore', 'flag')"),
    )
    op.create_index(
        "idx_review_mod_actions_review",
        "review_moderation_actions",
        ["review_id"],
    )

    # ============================================
    # New table: server_reputation_snapshots
    # ============================================

    op.create_table(
        "server_reputation_snapshots",
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
        sa.Column("snapshot_date", sa.Date(), nullable=False),
        sa.Column("avg_rating", sa.Numeric(3, 2), nullable=True),
        sa.Column(
            "review_count",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "verified_review_count",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "favorite_count",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
        sa.Column("heartbeat_uptime_pct", sa.Numeric(5, 2), nullable=True),
        sa.Column("avg_online_players", sa.Numeric(10, 2), nullable=True),
        sa.Column(
            "total_playtime_seconds",
            sa.BigInteger(),
            nullable=False,
            server_default="0",
        ),
        sa.Column("trust_score", sa.Numeric(5, 3), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "server_id", "snapshot_date", name="uq_reputation_server_date"
        ),
        comment="Daily materialized reputation scores for servers",
    )
    op.create_index(
        "idx_reputation_server_date",
        "server_reputation_snapshots",
        ["server_id", sa.text("snapshot_date DESC")],
    )
    op.create_index(
        "idx_reputation_trust_score",
        "server_reputation_snapshots",
        [sa.text("trust_score DESC NULLS LAST")],
    )


def downgrade() -> None:
    """Reverse all V2 schema changes."""

    # Drop new tables (reverse order)
    op.drop_table("server_reputation_snapshots")
    op.drop_table("review_moderation_actions")
    op.drop_table("review_votes")
    op.drop_table("reviews")
    op.drop_table("user_game_accounts")
    op.drop_table("server_platforms")

    # Revert reports CHECK to original
    op.drop_constraint("chk_reports_target_type", "reports", type_="check")
    op.create_check_constraint(
        "chk_reports_target_type",
        "reports",
        sa.text("target_type IN ('server', 'user', 'content')"),
    )

    # Drop locale CHECK
    op.drop_constraint("chk_users_locale", "users", type_="check")

    # Drop idempotency indexes
    op.drop_index("idx_playtime_events_idempotency", "playtime_events")
    op.drop_index("idx_server_heartbeats_idempotency", "server_heartbeats")

    # Drop FTS trigger, function, index, column
    op.execute(
        "DROP TRIGGER IF EXISTS trg_servers_search_vector_update ON servers;"
    )
    op.execute("DROP FUNCTION IF EXISTS servers_search_vector_update();")
    op.drop_index("idx_servers_search_vector", "servers")
    op.drop_column("servers", "search_vector")
