# Agentic Ecosystem Implementation Guide

## 1. Purpose

This document is the execution blueprint for establishing the FirstSpawn native-agentic ecosystem.

Scope of this guide:
- Define the production architecture for autonomous agents.
- Define guardrails, approval flow, and rollback behavior.
- Define data contracts, storage, and observability.
- Define rollout plan, quality gates, and runbooks.

## 2. Goals And Non-Goals

### Goals
- Build a safe multi-agent layer that continuously improves growth, retention, trust, support, and product quality.
- Ship autonomy in controlled tiers, with full auditability.
- Keep all high-risk actions under strict governance.

### Non-Goals
- Full autonomous execution with no human checkpoints in the initial 90 days.
- Direct execution of payment and identity-risk actions without explicit policy gates.

## 3. Target Operating Model

### Pods
- Growth and Marketing.
- Product and Retention.
- Software Development.
- Data Science and Intelligence.
- User Support and Community.
- Security and Integrity.

### Runtime Loop
- Observe -> Diagnose -> Plan -> Act -> Verify.

Each agent run must produce:
- hypothesis,
- chosen action,
- confidence,
- expected impact,
- risk class,
- rollback plan,
- evidence bundle.

## 4. System Architecture

## 4.1 Components

### A. Agent Orchestrator
- Runs schedules and event-triggered jobs.
- Assigns tasks to pod-specific worker agents.
- Enforces global concurrency and budget ceilings.

### B. Agent Worker Runtime
- Executes the runtime loop for one task.
- Calls approved tools and connectors.
- Emits structured action proposals/results.

### C. Policy Engine
- Maps action types to guardrails.
- Applies risk class rules and approval requirements.
- Blocks disallowed actions and records denial reason.

### D. Connector Layer
- Read connectors: product events, warehouse, app DB replica, logs, support tickets.
- Write connectors: feature flags, campaign tools, issue tracker, support system, content moderation queue.

### E. Memory Layer
- Short-term run memory: per-run state and temporary context.
- Long-term memory: prior decisions, outcomes, incident learnings, and strategy notes.

### F. Evaluation Layer
- Offline evaluation of recommendation quality.
- Online experiment evaluation with guardrail metrics.

### G. Observability Layer
- Traces for every run.
- Metrics for success, latency, and failure rates.
- Audit logs for every proposal and action.

## 4.2 Deployment Topology

Assumed baseline:
- Web on Vercel.
- Python API and workers on managed container runtime.
- PostgreSQL + Redis managed services.

Agent services:
- `agent-orchestrator` (Python service).
- `agent-worker` (autoscaled workers).
- `policy-engine` (shared internal service).
- `agent-api` (internal API for status and controls).

## 5. Repository Layout To Add

Add these workspaces:
- `firstspawn/agents` for runtime, policies, connectors, agent definitions.
- `firstspawn/data` for feature jobs, model training, and evaluations.

Recommended folders inside `firstspawn/agents`:
- `runtime/`
- `policies/`
- `connectors/`
- `agents/`
- `memory/`
- `evaluation/`
- `api/`
- `tests/`

## 6. Canonical Data Contracts

## 6.1 Agent Run Record

Each run must store:
- `run_id` (UUID),
- `agent_id`,
- `pod`,
- `task_type`,
- `input_ref`,
- `status`,
- `started_at`,
- `ended_at`,
- `confidence`,
- `risk_class`,
- `output_summary`,
- `evidence_ref`,
- `rollback_ref`.

## 6.2 Action Proposal Record

Each action proposal must store:
- `proposal_id` (UUID),
- `run_id`,
- `action_type`,
- `target_system`,
- `target_ref`,
- `policy_decision` (`allow`, `deny`, `needs_approval`),
- `required_approver_role`,
- `estimated_impact`,
- `max_blast_radius`,
- `expires_at`.

## 6.3 Decision Log Record

Each decision must store:
- `decision_id`,
- `proposal_id`,
- `human_approver` (nullable),
- `decision`,
- `reason`,
- `executed_at`,
- `result_status`,
- `result_metrics`,
- `incident_flag`.

## 6.4 Event Taxonomy Baseline

Required event families:
- Acquisition.
- Discovery.
- Identity.
- Social.
- Engagement.
- Monetization.
- Support and safety.

Minimum required fields on every event:
- `event_name`,
- `occurred_at`,
- `user_id` (nullable),
- `session_id` (nullable),
- `source`,
- `platform`,
- `properties` (JSON object),
- `schema_version`.

## 7. Agent Catalog (Phase 1)

Deploy these first eight agents:
- `growth.channel_scout`
- `growth.campaign_composer`
- `retention.lifecycle_orchestrator`
- `retention.churn_risk_analyst`
- `support.triage`
- `support.response_drafter`
- `dev.issue_miner`
- `security.fraud_detector`

For each agent define:
- primary KPI,
- secondary KPI,
- counter-metric,
- allowed action types,
- forbidden action types.

## 8. Action Classes And Guardrails

## 8.1 Risk Classes

- `R0`: read-only analysis.
- `R1`: write to internal planning tools (tickets, drafts, reports).
- `R2`: controlled production changes (feature flags, support routing, low-risk campaign variants).
- `R3`: high-risk actions (payments, identity security, schema changes, destructive actions).

## 8.2 Policy Matrix

### R0
- Auto-allow.
- No approval.

### R1
- Auto-allow if policy checks pass.
- Require evidence bundle.

### R2
- Requires confidence >= 0.80.
- Requires blast radius <= 10 percent targeted segment or <= 5,000 users, whichever is lower.
- Requires automatic rollback rule.
- Requires owner-on-call approval in first 60 days.

### R3
- Never autonomous in first 180 days.
- Requires explicit human approval from domain owner + safety reviewer.

## 8.3 Hard Blocks

Always block without explicit override ticket:
- Production schema migrations by agent action.
- Payment capture/refund execution.
- Account suspension/identity unlinking at scale.
- Outbound mass messaging without compliance guard checks.

## 9. Approval Workflow

Decision path:
- Agent proposes action.
- Policy engine evaluates and classifies.
- If approval needed, create approval task in issue system.
- Expire stale approvals after 24 hours.
- Log all approvals and denials.

Emergency kill switch:
- Global flag `AGENT_AUTONOMY_ENABLED=false`.
- Pod-level flags, for example `AGENT_POD_GROWTH_ENABLED=false`.
- Action-class flags, for example `AGENT_R2_ENABLED=false`.

## 10. Memory And Prompt Strategy

## 10.1 Short-Term Memory
- Run-local context window.
- Cleared after run completion.

## 10.2 Long-Term Memory
- Decision outcomes and postmortems.
- Successful and failed strategy patterns.
- Guardrail exceptions with resolution notes.

## 10.3 Prompt Registry
- Version every system prompt.
- Tie every run to `prompt_version`.
- Require changelog entry for every prompt update.

## 11. Model And Tooling Strategy

Default model policy:
- One primary reasoning model.
- One backup model for degraded mode.
- One deterministic lightweight model for classification/routing.

Tooling policy:
- Every tool invocation must include purpose metadata.
- Sensitive connectors must be allow-listed per agent.
- No dynamic tool discovery in production.

## 12. Monitoring And Alerts

Required metrics:
- run success rate,
- average decision latency,
- action acceptance rate,
- rollback rate,
- policy denial rate,
- false positive and false negative rates for safety agents,
- KPI delta attributable to agent actions.

Alert thresholds:
- run failure rate > 10 percent for 15 minutes.
- rollback rate > 5 percent on R2 actions in 24 hours.
- policy denial spike > 3x baseline in 1 hour.

## 13. Testing Strategy

## 13.1 Pre-Production
- Unit tests for policy rules.
- Integration tests for connectors.
- Replay tests using historical telemetry.
- Red-team tests for prompt injection and unsafe tool calls.

## 13.2 Production Safeguards
- Canary rollout per pod.
- Shadow mode before enabling any new R2 action.
- Auto-disable action type after repeated failures.

Acceptance criteria for each new agent:
- > 95 percent valid output format.
- > 80 percent human acceptance for R1 recommendations.
- no critical policy violations in 14-day shadow period.

## 14. 90-Day Implementation Plan

## Days 0-30
- Build runtime skeleton, policy engine, and audit schema.
- Integrate core read connectors.
- Launch Tier 0 for growth, retention, and support triage.
- Ship weekly autonomous executive brief.

## Days 31-60
- Enable Tier 1 for issue triage, campaign drafts, and support routing proposals.
- Launch churn risk model v1 and fraud detector v1 in recommendation mode.
- Add approval workflow and rollback automation.

## Days 61-90
- Enable selected R2 actions with tight blast radius.
- Deploy cross-pod conflict resolver for KPI conflicts.
- Run autonomy game day and incident simulations.

## 15. Runbooks

## 15.1 Incident: Unsafe Action Attempt
- Freeze pod autonomy flag.
- Mark run and proposal as incident.
- Collect evidence and traces.
- Open incident ticket with severity and owner.
- Complete postmortem within 48 hours.

## 15.2 Incident: KPI Regression After Agent Action
- Trigger rollback defined in proposal.
- Pause related action type.
- Compare pre/post segments and isolate causal factors.
- Re-enable only after owner sign-off.

## 15.3 Incident: Connector Failure
- Fail closed for write connectors.
- Fail open for non-critical read connectors with degraded mode warnings.
- Retry with exponential backoff and circuit breaker.

## 16. Governance Cadence

Weekly:
- Pod KPI review and exception review.
- Safety review of all R2 actions.

Monthly:
- Policy tuning and prompt review.
- Agent performance audit and promotion/demotion decisions.

Quarterly:
- Autonomy tier expansion decisions.
- Architecture and budget review.

## 17. Definition Of Done

The ecosystem is considered established when:
- all eight Phase 1 agents are live in production at Tier 0/1,
- at least three low-risk R2 actions are operating with rollback and audit trails,
- all actions are searchable by run and decision IDs,
- incident playbooks are tested and pass game day checks,
- weekly autonomous brief is trusted by domain owners and used for planning.

## 18. Immediate Implementation Checklist

1. Create `firstspawn/agents` and `firstspawn/data` workspaces.
2. Implement run, proposal, and decision storage schemas.
3. Implement policy engine with risk classes R0-R3.
4. Implement support triage and churn analyst as first two production agents.
5. Wire observability and global kill switch before enabling any R2 action.
