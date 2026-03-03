# Architecture And Stack

## 1. Monorepo Baseline

This repository uses npm workspaces + Turborepo.

Current workspaces:
- `firstspawn/web` (Next.js web app)
- `firstspawn/api` (API workspace placeholder)
- `firstspawn/mobile` (mobile scaffold)
- `packages/ui` (shared UI package)
- `packages/config` and `packages/typescript-config` (shared config)

Turborepo can orchestrate multi-language tasks, including Python services and data jobs.

## 2. Technology Decisions (Current)

### Frontend
- Next.js 16 App Router.
- React + TypeScript.
- Tailwind CSS + motion library.
- Pixel-retro design language with accessibility constraints.

### Backend
- Python-first direction for service layer.
- Recommended baseline: Django + Django ORM + DRF (or FastAPI for isolated service boundaries).
- Keep API contract clean and versioned (`/api/v1/...`).

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

### API/Data
- Managed PostgreSQL + managed Redis for MVP velocity.
- API and worker processes deploy independently.
- Health checks, structured logs, and error tracking required before broad launch.

## 7. Design And UX Constraints

- Keep information density high but readable.
- Preserve strong visual identity (pixel-retro) while maintaining WCAG-level usability.
- Use TypeScript contracts end-to-end for frontend reliability.
