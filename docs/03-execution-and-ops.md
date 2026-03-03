# Execution And Operations

## 1. Delivery Plan

### Phase 0: Alignment And Foundations
- Lock MVP scope and document decisions in `docs/`.
- Finalize event taxonomy and telemetry contracts.
- Finalize v1 API contract and v1 data model.
- Stand up baseline CI checks and environment templates.
- Define graceful degradation behavior for optional third-party services.

### Phase 1: Core MVP Platform
- Implement auth, identity safety, and profile basics.
- Ship discovery core (listing/detail/search/filter/ranking baseline).
- Ship plugin verification + heartbeat + playtime sync.
- Ship moderation baseline and abuse controls.
- Launch agentic Tier 0 and Tier 1 for selected pods.

### Phase 2: Trust And Reliability Expansion
- Complete owner workflows and dashboard foundations.
- Improve loading states, responsiveness, and accessibility.
- Add caching and background jobs.
- Introduce review system as post-core trust feature.
- Harden observability: logs, metrics, traces, alerting.

### Phase 3: Growth And Controlled Autonomy
- Roll out trust/reputation scoring refinements.
- Introduce retention/recommendation signals from Python data layer.
- Enable selected Tier 2 low-risk actions with rollback and approvals.

## 2. Implementation Priority Order

1. Auth and identity safety.
2. Server discovery quality (search, filters, ranking).
3. Plugin verification and telemetry integrity.
4. Agentic Tier 0/1 runtime, policies, and observability.
5. Owner utility (claim/edit/analytics foundations).
6. Reviews and deeper social systems.

## 3. Hard Quality Gates

Every milestone and merge to `main` must satisfy:

1. Lint gate:
   - `npm run lint` passes in all affected workspaces.
2. Build gate:
   - `npm run build` passes for affected deployable workspaces.
3. Test gate:
   - Critical-path changes require automated tests.
   - If a test harness is missing, introducing the harness is part of the change.
4. Security gate:
   - No unresolved critical vulnerabilities in direct dependencies for shipped workspaces.
   - No new exposed secrets or `.env` leaks.
5. Observability gate:
   - New critical flows include success/failure instrumentation.
   - Error paths are logged with actionable context.
6. Documentation gate:
   - API, schema, event, policy, or rollout changes must update relevant files under `docs/` in the same PR.
7. Rollback gate:
   - Any R2 autonomous action must define blast radius, rollback trigger, and owner-on-call.

## 4. Team Operating Model

### Agent/Role Ownership
- Clear owner per domain: product, frontend, backend, data, security, growth, support.
- Domain owners define KPIs, thresholds, and escalation policies.

### Autonomous Execution Policy
- Tier 0/1 by default.
- Tier 2 only for explicitly allow-listed low-risk action classes.
- Security-sensitive and high-impact actions remain human-gated.

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
- Active docs live only in `docs/`.
- Old markdown stays in archive for reference only.
- Update existing docs before creating new ones.
- API and data-shape changes must reference `05-api-v1-contract.md` and `06-data-model-v1.md`.

## 6. Immediate Next Actions

1. Expand `firstspawn/api-py` scaffold into full v1 API modules.
2. Migrate from `firstspawn/api` placeholder to Python service incrementally.
3. Implement v1 API contract from `docs/05-api-v1-contract.md`.
4. Implement v1 schema from `docs/06-data-model-v1.md`.
5. Add CI workflow enforcing the hard quality gates.
6. Configure Vercel to keep `firstspawn/web` as the only deploy root.
