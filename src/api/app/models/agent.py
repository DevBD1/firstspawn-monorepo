"""Agentic audit models for autonomous operations."""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import ForeignKey, Index, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class AgentRun(Base):
    """Audit log for autonomous agent executions."""

    __tablename__ = "agent_runs"

    run_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    agent_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    pod: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    task_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    confidence: Mapped[Decimal | None] = mapped_column(
        Numeric(4, 3),
        nullable=True,
    )
    risk_class: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    input_ref: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    output_summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    evidence_ref: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    rollback_ref: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    started_at: Mapped[datetime] = mapped_column(
        nullable=False,
    )
    ended_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
    )

    # Relationships
    action_proposals: Mapped[list["ActionProposal"]] = relationship(
        back_populates="agent_run",
        cascade="all, delete-orphan",
    )

    __table_args__ = ({"comment": "Audit log for autonomous agent executions"},)


class ActionProposal(Base):
    """Proposed actions by agents awaiting approval."""

    __tablename__ = "action_proposals"

    proposal_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    run_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("agent_runs.run_id", ondelete="CASCADE"),
        nullable=False,
    )
    action_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    target_system: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    target_ref: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    policy_decision: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    required_approver_role: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    estimated_impact: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )
    max_blast_radius: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    expires_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        nullable=False,
    )

    # Relationships
    agent_run: Mapped["AgentRun"] = relationship(back_populates="action_proposals")
    decision_logs: Mapped[list["DecisionLog"]] = relationship(
        back_populates="action_proposal",
        cascade="all, delete-orphan",
    )

    __table_args__ = ({"comment": "Proposed actions by autonomous agents"},)


class DecisionLog(Base):
    """Log of decisions made on action proposals."""

    __tablename__ = "decision_logs"

    decision_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    proposal_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("action_proposals.proposal_id", ondelete="CASCADE"),
        nullable=False,
    )
    human_approver: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    decision: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    executed_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
    )
    result_status: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    result_metrics: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )
    incident_flag: Mapped[bool] = mapped_column(
        nullable=False,
        default=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        nullable=False,
    )

    # Relationships
    action_proposal: Mapped["ActionProposal"] = relationship(back_populates="decision_logs")

    __table_args__ = ({"comment": "Decision audit log for action proposals"},)
