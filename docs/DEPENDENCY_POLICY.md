# Dependency Management Policy

This document outlines how we manage dependencies in the FirstSpawn monorepo.

## Philosophy

- **Stability over bleeding edge**: Prefer well-tested, stable versions
- **Security first**: Keep dependencies updated for security patches
- **Minimal dependencies**: Only add what we need
- **Reproducible builds**: Lockfiles ensure consistent installations

## Update Cadence

### Weekly (Automated)

- **Patch updates**: Security fixes and bug fixes
- **Automated PRs**: Created by Dependabot

### Bi-weekly (Manual Review)

- **Minor updates**: New features, backward compatible
- **Review requirements**: Check changelogs for breaking changes

### Quarterly (Planned)

- **Major updates**: Breaking changes, requires planning
- **Coordination needed**: May require code changes

## Version Constraints

### Node.js/npm

```json
// package.json
{
  "dependencies": {
    // Runtime deps: allow minor updates
    "next": "^16.0.0",
    "react": "^19.0.0"
  },
  "devDependencies": {
    // Dev deps: allow patch updates only for stability
    "typescript": "~5.5.0"
  }
}
```

### Python

```toml
# pyproject.toml
[project]
dependencies = [
    # Pin to minor version for stability
    "fastapi>=0.118.0,<0.120.0",
    "sqlalchemy>=2.0.0,<2.1.0",
]
```

## Lockfile Rules

### pnpm-lock.yaml

- **Always commit**: Ensures reproducible builds
- **Never manually edit**: Always use `pnpm install`
- **Update command**: `pnpm update` or `pnpm add package@version`

### Python uv.lock (Future)

- **Commit when using uv**: For reproducible Python environments
- **Current**: Using requirements files for now

## Adding New Dependencies

### Process

1. **Evaluate necessity**: Is this the lightest solution?
2. **Check maintenance**: Is it actively maintained?
3. **Check license**: Compatible with MIT?
4. **Test locally**: Ensure it works in your branch
5. **Document**: Add to relevant README if needed

### Approval

- **Minor/Patch**: No approval needed, just PR
- **Major**: Discuss in #dev-dependencies channel
- **New category**: Requires architecture review

## Security

### Automated Scanning

- **Dependabot alerts**: Enabled for all repos
- **pnpm audit**: Runs in CI (moderate level blocks)
- **GitHub Security Advisories**: Monitored by security team

### Response Time

| Severity | Response  | Timeline                |
| -------- | --------- | ----------------------- |
| Critical | Immediate | Within 24 hours         |
| High     | Urgent    | Within 3 days           |
| Moderate | Normal    | Within 2 weeks          |
| Low      | Scheduled | Next maintenance window |

## Deprecated Dependencies

When a dependency is deprecated:

1. **Immediate**: Create issue to track replacement
2. **Within 1 month**: Identify replacement
3. **Within 3 months**: Complete migration

## Monitoring

### Weekly Tasks (Every Monday)

- [ ] Review Dependabot PRs
- [ ] Run `pnpm audit` locally
- [ ] Check for deprecated packages

### Monthly Tasks (First Monday)

- [ ] Review bundle size impact
- [ ] Check for alternative lighter packages
- [ ] Update documentation

## Tools

### Current Stack

- **Dependabot**: Automated dependency updates
- **pnpm audit**: Security vulnerability scanning
- **depcheck**: Unused dependency detection

### Planned

- **Renovate**: More advanced dependency management
- **Snyk**: Additional security scanning

## Emergency Updates

If a critical security vulnerability is found:

1. Create hotfix branch from `main`
2. Update affected dependencies
3. Run full CI pipeline
4. Deploy to staging
5. Deploy to production
6. Merge back to `main`

## Questions?

Contact the platform team or open a discussion in #dev-dependencies.
