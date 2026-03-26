"""Add verification_tokens table

Revision ID: 005_verification_tokens
Revises: 004_email_confirmed_at
Create Date: 2026-03-22 20:25:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '005_verification_tokens'
down_revision = '004_email_confirmed_at'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'verification_tokens',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('token_hash', sa.Text(), nullable=False),
        sa.Column('purpose', sa.String(length=50), server_default='email_verification', nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint("purpose IN ('email_verification', 'password_reset')", name='chk_verification_tokens_purpose'),
        comment='Secure tokens for sensitive account actions'
    )
    op.create_index('idx_verification_tokens_token_hash', 'verification_tokens', ['token_hash'], unique=True)
    op.create_index('idx_verification_tokens_user_id', 'verification_tokens', ['user_id'])


def downgrade() -> None:
    op.drop_index('idx_verification_tokens_user_id', table_name='verification_tokens')
    op.drop_index('idx_verification_tokens_token_hash', table_name='verification_tokens')
    op.drop_table('verification_tokens')
