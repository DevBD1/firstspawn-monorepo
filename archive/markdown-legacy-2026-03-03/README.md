# FirstSpawn

FirstSpawn is a discovery ecosystem for Minecraft and Hytale: server listing, social trust, identity sync, guilds, reviews, and retention loops (daily puzzles, badges, progression).

## Vision

FirstSpawn is not just a server directory. It is a social network for game-server communities, where discovery and credibility are tied to verified activity and reputation.

## Monorepo

This repository is an npm workspace + Turborepo monorepo.

```txt
firstspawn-monorepo/
├── firstspawn/
│   ├── web/          # Next.js frontend (@firstspawn/web)
│   ├── api/          # Backend service workspace (planned/evolving)
│   └── mobile/       # Mobile app workspace
├── packages/
│   ├── ui/           # Shared UI package
│   ├── config/       # Shared config
│   └── typescript-config/
├── turbo.json
└── package.json
```

## Architecture Decisions (Q1 2026)

### 1) Does Turborepo support Python libraries?

Yes. Turborepo is language-agnostic task orchestration. It can run Python tasks (lint/test/build/jobs) as long as each workspace exposes scripts/commands.

Practical setup:
- Keep frontend workspaces in npm workspaces.
- Add Python service directories (for example `firstspawn/api-py`, `firstspawn/data`).
- Run Python tools via project scripts (`uv`, `poetry`, or `pip`) and let Turbo cache outputs.

### 2) Frontend choice when UI/UX is critical

Recommendation: keep frontend on `Next.js + React + TypeScript`.

Reason:
- Strongest ecosystem for polished UI/UX, animation, accessibility, design systems, and performance tooling.
- Better component-level control than Python-first UI frameworks for a consumer-grade social product.

### 3) Is PostgreSQL + Django ORM enough?

Yes for MVP and early scale, with these defaults:
- PostgreSQL as source of truth.
- Django ORM for transactional data and admin velocity.
- Add Redis for caching/queues.
- Add Postgres extensions (`pg_trgm`, optional `pgvector`) for search/relevance when needed.

This stack is enough to ship discovery, accounts, reviews, favorites, guild basics, and moderation workflows.

### 4) How to position data science in this product?

Use a dedicated Python data layer, separate from request-response web paths:
- Event pipeline for product telemetry.
- Batch/near-real-time feature jobs (retention, trust score, recommendation signals).
- Experimentation and model training (notebooks -> production jobs).
- Scheduled orchestration with Prefect/Airflow.

Keep model inference behind APIs/workers and do not block critical web requests on heavy DS tasks.

### 5) If not Python frontend, TS over JS?

Yes. TypeScript is the right default for this codebase:
- safer refactors across monorepo packages,
- better API contracts,
- lower UI regression risk in a fast-moving product.

## Recommended Stack Split

- Frontend: Next.js 16 + React + TypeScript + Tailwind.
- Backend: Django (+ Django REST Framework or FastAPI for service boundaries where needed).
- Database: PostgreSQL (+ Redis).
- Data science and data engineering: Python (Pandas/Polars, scikit-learn, orchestration via Prefect/Airflow).
- Analytics: PostHog.

## Local Development

Install deps:

```bash
npm install
```

Run all `dev` tasks in monorepo:

```bash
npm run dev
```

Run only web:

```bash
npm run dev -- --filter=@firstspawn/web
```

## Deployment

- Vercel project `firstspawn` is configured to deploy only from `firstspawn/web`.
- Production branch is `main`.

---

FirstSpawn: turning server discovery into an adventure.
