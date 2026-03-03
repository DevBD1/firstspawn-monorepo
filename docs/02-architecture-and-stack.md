# Architecture And Stack

## 1. Monorepo Baseline

This repository uses npm workspaces + Turborepo.

Current workspaces:
- `firstspawn/web` (Next.js web app)
- `firstspawn/api` (API workspace placeholder)
- `firstspawn/api-py` (FastAPI production API scaffold)
- `firstspawn/mobile` (mobile scaffold)
- `packages/ui` (shared UI package)
- `packages/config` and `packages/typescript-config` (shared config)

Planned additions in-monorepo:
- `firstspawn/agents` (agent runtime and policy engine)
- `firstspawn/data` (feature jobs, evaluations, model workflows)

Turborepo remains the orchestration layer for both JavaScript and Python tasks.

## 2. Technology Decisions (Current)

### Frontend
- Next.js 16 App Router.
- React + TypeScript.
- Tailwind CSS + motion library.
- Pixel-retro design language with accessibility constraints.

### Backend
- Python-first direction for service layer.
- Framework decision: FastAPI for MVP and near-term scale.
- ORM and migrations: SQLAlchemy 2.x + Alembic.
- Validation/serialization: Pydantic v2.
- Keep API contract clean and versioned (`/api/v1/...`).

Rationale for FastAPI over Django for this project:
- Faster iteration for API-first development and plugin integrations.
- Cleaner fit for service boundaries needed by agentic runtime and background workers.
- Strong typing and schema generation with lower framework overhead.

### Data Stores
- PostgreSQL as source of truth.
- Redis for caching, queues, rate-limiting support.
- PostgreSQL FTS for MVP search.
- Elasticsearch optional for later scale/complex search.

### Data Science And Data Engineering
- Python layer for telemetry modeling, churn/fraud/ranking features, and experimentation analysis.
- Batch/near-real-time jobs run outside critical request paths.
- Orchestration via Prefect/Airflow-class workflow tooling.

## 3. Product System Architecture

### Core Domains
- Identity and authentication.
- Users and profiles.
- Servers and tags.
- Reviews and trust signals.
- Favorites and engagement events.
- Plugin verification and playtime telemetry.

### Verification Path
Server plugin authenticates with key + HMAC + timestamp -> heartbeat and playtime sync -> verification and trust signals updated.

### Real-Time Path
WebSocket events for status changes, notifications, and key social events where needed.

## 4. API Design Rules

- REST-first for external and internal clients.
- Explicit pagination and filtering metadata.
- Consistent response and error envelope.
- Public vs protected routes clearly separated.
- Rate-limits by actor category (guest, user, owner/plugin).
- Canonical URL env contract:
  - `NEXT_PUBLIC_SITE_URL` is the single canonical public base URL.
  - App logic should not rely on `NEXT_PUBLIC_APP_URL`; use request origin fallback when needed.

## 5. Security Baseline

- Password hashing (Argon2id-class strategy).
- JWT access + refresh rotation model.
- OAuth linking with explicit identity ownership checks.
- Plugin API hardening: HMAC signatures, replay-window checks, per-key limits.
- Input validation on every boundary.
- Least-privilege data access patterns.
- Auditability for autonomous actions and sensitive operations.

## 6. Deployment Baseline

### Web
- Vercel project configured to deploy only `firstspawn/web`.
- Production branch: `main`.
- Ensure Vercel project settings keep:
  - root directory: `firstspawn/web`,
  - framework preset: Next.js,
  - source files outside root directory: enabled (for monorepo shared packages).

### API/Data
- Managed PostgreSQL + managed Redis for MVP velocity.
- API and worker processes deploy independently.
- Health checks, structured logs, and error tracking required before broad launch.

## 7. Workspace Maturity Model

Maturity levels:
- `L0` Scaffold: placeholder or bootstrap only.
- `L1` Prototype: functional locally but not release-hardened.
- `L2` Beta: deployable with known gaps and explicit operational constraints.
- `L3` Production: release-hardened with quality gates consistently passing.

Current target mapping:
- `@firstspawn/web`: `L2` Beta (targeting `L3` after lint/build/test/security gates are green).
- `@firstspawn/api`: `L0` Scaffold (to be replaced by `firstspawn/api-py`).
- `@firstspawn/mobile`: `L0` Scaffold.
- `@firstspawn/ui`: `L1` Prototype.

## 8. Design And UX Constraints

- Keep information density high but readable.
- Preserve strong visual identity (pixel-retro) while maintaining WCAG-level usability.
- Use TypeScript contracts end-to-end for frontend reliability.
