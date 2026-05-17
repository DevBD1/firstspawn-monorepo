# AGENTS.md

Router and global rules for AI agents working in `firstspawn-monorepo`.

## Project Snapshot

FirstSpawn is a discovery and trust platform for game servers, starting with
Hytale and expanding to Minecraft.

Core thesis:

- Discovery should be relevance-driven, not pay-to-win.
- Trust should be earned through verified activity and reputation.
- Retention should come from repeatable discovery and trust loops.

## Source Of Truth

When files disagree, use this order:

1. `DESIGN.md`: only product UI/UX source of truth.
2. Service READMEs: service runtime, setup, commands, and endpoint state.
3. `packages/database/schema-design.md`: canonical database design.
4. `PRODUCT.md`: product scope, users, non-goals, and success criteria.
5. `PLAN.md`: roadmap and recommended next standards.
6. `.agents/skills/*`: task workflows and checklists only.
7. Root `README.md`: repo overview and shared setup.

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
│   └── implementation-history/   # Completed or accepted implementation notes
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
- Use `docs/implementation-history/` for completed or accepted implementation
  notes that should survive cleanup.
- Put product scope and future product ideas in `PRODUCT.md`.
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
