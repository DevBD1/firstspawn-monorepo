# AGENTS.md

Router and global rules for AI agents working in `firstspawn-monorepo`.

## Project Snapshot

FirstSpawn is a discovery and trust platform for game servers. The MVP is a
web-first Minecraft Java (`mc_java`) discovery and voting platform; other games
and platforms are post-MVP (see `docs/releases/v1-mvp.md` §3.1 and §20).

Core thesis:

- Discovery should be relevance-driven, not pay-to-win.
- Trust should be earned through verified activity and reputation.
- Retention should come from repeatable discovery and trust loops.

## Source Of Truth

When files disagree, use this order:

1. `PRODUCT.md`: product constitution — vision, principles, identity, and
   governance (apex; nothing may contradict its principles).
2. `docs/releases/<active>.md`: current version feature scope (active:
   `docs/releases/v1-mvp.md`).
3. `DESIGN.md`: product UI/UX source of truth.
4. Service READMEs: service runtime, setup, commands, and endpoint state.
5. `packages/database/schema-design.md`: canonical database design.
6. `PLAN.md`: live execution sequencing for the active release.
7. `CHANGELOG.md`: shipped-version history.
8. `.agents/skills/*`: task workflows and checklists only.
9. Root `README.md`: repo overview and shared setup.

Each domain doc is authoritative within its domain; if one contradicts a
`PRODUCT.md` principle, `PRODUCT.md` wins and the domain doc is corrected. See
`PRODUCT.md` §5 for the full document map and release lifecycle.

Keep this file as a router. Do not add detailed UI/UX, API, database,
collector, or i18n rulebooks here.

## Repo Map

```text
firstspawn-monorepo/
├── apps/
│   ├── api/              # Fastify API, code in apps/api/src
│   ├── collector/        # Heartbeat collector, code in apps/collector/src
│   ├── web/              # Next.js app, code in apps/web/src
│   └── mobile/           # Expo scaffold
├── packages/
│   ├── database/         # Drizzle config + SQL migrations
│   ├── ui/               # Shared UI source package
│   ├── config/           # Shared ESLint config
│   └── typescript-config/# Shared TS configs
├── docs/
│   ├── releases/                 # Per-version frozen feature scope
│   └── archive/                  # Superseded docs + completed implementation notes
└── infrastructure/       # Operational scripts and infra notes
```

## Engineering Invariants

- Prefer simple code and simple files over clever abstractions.
- Keep one clear responsibility per file, function, component, service, or route.
- Keep business rules centralized. Do not duplicate the same rule in routes,
  components, hooks, actions, jobs, or services.
- Follow ACID for database mutations and multi-step writes that must not leave
  partial state.
- Shared does not mean global by default:
  - cross-app primitives belong in `packages/ui`
  - shared web-only primitives belong in `apps/web/src/components`
  - domain-aware web logic belongs in `apps/web/src/features/<feature>`
  - route composition usually belongs directly in route `page.tsx`
- Promote code to shared only when reuse is real or very likely.

## Comments

- Add short TSDoc/JSDoc above exported reusable APIs, shared components, hooks,
  services, classes, schemas, token maps, generator scripts, and
  formatter/view-model builders.
- Add short line comments only for non-obvious local intent, orchestration,
  consistency rules, cache/concurrency behavior, hydration safeguards, or
  review-driven fixes.
- Do not comment simple assignments, obvious JSX, or one-off local helpers.
- Before finishing code changes, do a quick comment pass on touched files.

## Documentation And Secrets

- Keep `docs/` minimal.
- Use `docs/archive/` for completed implementation notes and superseded docs
  that should survive cleanup.
- Put durable vision, principles, and governance in `PRODUCT.md`; put a
  version's feature scope and future-feature exclusions in the active release
  file under `docs/releases/`; record shipped versions in `CHANGELOG.md`.
- Put service-specific runtime details in the nearest service README.
- Put product UI/UX baseline changes only in `DESIGN.md`.
- Never commit `.env` files.
- Secrets stay server-side only.
- Only publish-safe values may use the `NEXT_PUBLIC_` prefix.

## Skill Routing

Use the narrowest relevant skill:

| Work area | Skill |
| --- | --- |
| Broad repo orientation or audits | `firstspawn-repo-orientation` |
| Product UX, page hierarchy, CTAs, placement | `firstspawn-product-ux` |
| UI execution, components, tokens, visual audits | `firstspawn-ui-design-system` |
| Web copy, dictionaries, locale routing | `firstspawn-web-i18n` |
| React/Next implementation behavior | `firstspawn-web-app-patterns` |
| Landing, marketing routes, public assets, SEO/OG | `firstspawn-landing-public-web` |
| API routes, auth, catalog contracts | `firstspawn-api-catalog-auth` |
| Database schema, Drizzle, migrations, SQL jobs | `firstspawn-database-migrations` |
| Collector, heartbeats, freshness behavior | `firstspawn-collector-freshness` |
| Local Docker, compose services, runtime debugging | `firstspawn-local-runtime-docker` |
| Implementation history and continuation notes | `firstspawn-implementation-history` |
| Dev-only component experiments | `firstspawn-component-lab` |
| Branches, worktrees, commits, hook fixes | `firstspawn-git-release-flow` |
| Focused Next.js performance review | `vercel-react-best-practices` |
| Stitch `DESIGN.md` synthesis | `design-md` |
| Stitch screen generation/editing | `stitch-design` |

Vendor skills are external workflow helpers. For FirstSpawn implementation,
root `DESIGN.md` still wins over `.stitch/DESIGN.md` or generated design
context.

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm format
pnpm typecheck
pnpm test
pnpm ci
```

Useful targeted commands:

```bash
pnpm --filter @firstspawn/web dev
pnpm --filter @firstspawn/web lint:i18n
pnpm --filter @firstspawn/api dev
pnpm --filter @firstspawn/collector dev
pnpm --filter @firstspawn/ui check:styles
pnpm --dir packages/database run generate
pnpm --dir packages/database run migrate
```
