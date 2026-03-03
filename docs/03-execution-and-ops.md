# Execution And Operations

## 1. Delivery Plan

### Phase 0: Alignment And Foundations
- Lock scope for MVP.
- Finalize event taxonomy and telemetry contracts.
- Define API contract surface for web + plugin.
- Stand up baseline CI checks and environment templates.

### Phase 1: Core Platform
- Implement auth, users, servers, reviews, favorites.
- Ship PostgreSQL-backed search and filtering.
- Add plugin verification + heartbeat + playtime sync.
- Establish baseline moderation and anti-abuse controls.

### Phase 2: UX And Reliability
- Complete dashboard and owner workflows.
- Improve loading states, responsiveness, and accessibility.
- Add caching and background jobs.
- Introduce observability: logs, metrics, traces, alerting.

### Phase 3: Growth And Intelligence
- Roll out trust/reputation scoring refinements.
- Introduce retention and recommendation signals from Python DS layer.
- Expand automation from analysis to guardrailed action loops.

## 2. Implementation Priority Order

1. Auth and identity safety.
2. Server discovery quality (search, filters, ranking).
3. Review integrity and verification path.
4. Owner utility (claim/edit/analytics foundations).
5. Retention systems and social systems.

## 3. Quality Gates

Every milestone requires:
- Passing automated checks.
- No unresolved critical security findings.
- Performance baseline met on key routes.
- Observability hooks present for new critical paths.
- Documentation updated in `new-docs/`.

## 4. Team Operating Model

### Agent/Role Ownership
- Clear owner per domain: product, frontend, backend, data, security, growth, support.
- Domain owners define KPIs and escalation thresholds.

### Autonomous Execution Policy
- Tier 0/1 by default.
- Tier 2 only for low-risk actions with rollback.
- Security-sensitive actions remain human-gated longer.

## 5. Development Workflow

### Common Commands
```bash
npm install
npm run dev
npm run build
npm run lint
```

### Workspace-targeted run
```bash
npx turbo run dev --filter=@firstspawn/web
```

### Documentation Rule
- Active docs live only in `new-docs/`.
- Old markdown stays in archive for reference only.
- New changes should update only relevant unified docs, not create scattered plan files.

## 6. Immediate Next Actions

1. Create backend Python workspace plan (`firstspawn/api-py`) with package/tooling conventions.
2. Define migration path from placeholder API workspace to production-ready API service.
3. Lock v1 database schema and API contract to unblock web integration.
4. Start a single source-of-truth tracking board aligned with this document.
