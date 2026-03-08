# FirstSpawn

> Discovery and trust platform for game servers

[![CI](https://github.com/firstspawn/firstspawn-monorepo/actions/workflows/ci.yml/badge.svg)](https://github.com/firstspawn/firstspawn-monorepo/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Overview

FirstSpawn is a discovery and trust platform for game servers, starting with
Hytale and expanding to Minecraft. Built as a monorepo using npm workspaces +
Turborepo.

**Core Thesis:**

- Discovery should be relevance-driven, not pay-to-win
- Trust should be earned through verified activity and reputation
- Retention should come from meaningful loops (favorites, reviews, guilds, daily
  participation)

## Documentation

Comprehensive documentation is available in the `docs/` directory:

1. **[Product & Strategy](docs/plans/01-product-and-strategy.md)** - Vision,
   audience, monetization
2. **[Architecture & Stack](docs/plans/02-architecture-and-stack.md)** - Tech
   decisions, security, deployment
3. **[Execution & Operations](docs/plans/03-execution-and-ops.md)** - Roadmap,
   quality gates, workflow
4. **[Agentic Ecosystem Guide](docs/plans/04-agentic-ecosystem-implementation-guide.md)** -
   Autonomous agents
5. **[API v1 Contract](docs/plans/05-api-v1-contract.md)** - API endpoints, auth,
   standards
6. **[Data Model v1](docs/plans/06-data-model-v1.md)** - PostgreSQL schema baseline

## Quick Start

### Prerequisites

- **Node.js** >= 18 (we recommend using [nvm](https://github.com/nvm-sh/nvm))
- **npm** >= 10 (managed via `packageManager` field)
- **Python** >= 3.11 (for API)
- **Docker** & **Docker Compose** (for local infrastructure)

### Installation

```bash
# Clone the repository
git clone https://github.com/firstspawn/firstspawn-monorepo.git
cd firstspawn-monorepo

# Install Node.js dependencies
npm install

# Install Python dependencies (for API)
cd src/api
pip install -e ".[dev]"
cd ../..

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Running Locally

```bash
# Start infrastructure (PostgreSQL + Redis)
docker-compose up -d postgres redis

# Run database migrations
cd src/api && alembic upgrade head && cd ../..

# Start all development servers
npm run dev
```

The following services will be available:

- **Web App**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Environment Variables

Required environment variables (see `.env.example` for full list):

```bash
# Web
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_POSTHOG_KEY=your_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# API
API_ENV=development
API_DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/firstspawn
API_REDIS_URL=redis://localhost:6379/0

# Optional (with graceful degradation)
RESEND_API_KEY=your_key
GEMINI_API_KEY=your_key
```

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start all dev servers with hot reload

# Building
npm run build        # Build all packages
npm run clean        # Clean all build artifacts

# Code Quality
npm run lint         # Run ESLint across all packages
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier
npm run format:check # Check formatting without modifying files
npm run typecheck    # Run TypeScript type checking
npm run ci           # Run full CI pipeline locally

# Testing
npm run test         # Run all tests (placeholder - not yet implemented)

# API Specific
cd src/api
alembic upgrade head              # Run pending migrations
alembic revision --autogenerate   # Create new migration
ruff check .                      # Python linting
ruff format .                     # Python formatting
mypy app/                         # Python type checking
```

### Project Structure

```
firstspawn-monorepo/
├── src/
│   ├── api/              # FastAPI production API (Python)
│   ├── web/              # Next.js 16 web app (beta)
│   └── mobile/           # Expo/React Native scaffold
├── infrastructure/       # Docker Compose, database init
├── packages/
│   ├── ui/               # Shared UI components (no build)
│   ├── typescript-config/# Shared TS configs
│   └── config/           # Shared ESLint config
├── docs/                 # Product documentation
│   ├── DEPENDENCY_POLICY.md
│   ├── plans/            # Planning documents
│   └── implementations/  # Handover logs
```

## Testing

> **Note:** Testing framework is not yet implemented. Planned for Q2 2026.

When implemented, tests will be co-located with source files or in `__tests__/`
directories:

```bash
# Run all tests
npm run test

# Run tests for specific workspace
npx turbo run test --filter=@firstspawn/web

# Run with coverage
npm run test -- --coverage
```

## Release Process

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Creating a Release

1. Ensure all tests pass: `npm run ci`
2. Update version in relevant `package.json` files
3. Create a release PR with changelog updates
4. After merge, tag the release:

```bash
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin v0.2.0
```

5. CI will automatically deploy to production (configured in Vercel)

### Deployment

- **Web**: Vercel (automatic on push to `main`)
- **API**: Planned for managed container runtime
- **Database**: PostgreSQL managed service

## Contributing

We welcome contributions! Please read our guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run the full CI pipeline: `npm run ci`
5. Commit your changes (pre-commit hooks will run automatically)
6. Push to your fork: `git push origin feature/your-feature`
7. Open a Pull Request

### Code Style

- **TypeScript**: Strict mode, prefer interfaces over types
- **Python**: PEP 8 compliance, type hints required
- **Formatting**: Prettier (JS/TS), Ruff (Python)
- **Linting**: ESLint (JS/TS), Ruff (Python), MyPy (Python types)

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new server discovery endpoint
fix: resolve memory leak in heartbeat handler
docs: update API authentication examples
refactor: simplify database query logic
test: add integration tests for auth flow
chore: update dependencies
```

### Pull Request Process

1. Fill out the PR template completely
2. Ensure CI checks pass
3. Request review from CODEOWNERS
4. Address review feedback
5. Squash and merge when approved

### Reporting Issues

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots if applicable

## Technology Stack

### Frontend (Beta)

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 + Framer Motion
- **UI**: React 19, Lucide React icons
- **i18n**: Custom deep-merge system (EN, TR, DE, RU, ES, FR supported; MVP launch: EN, TR, DE)

### Backend (API)

- **Language**: Python 3.11+
- **Framework**: FastAPI
- **ORM**: SQLAlchemy 2.x + Alembic
- **Database**: PostgreSQL 16
- **Cache**: Redis 7

### Shared Packages

- `@firstspawn/ui`: Source TypeScript (no build step)
- `@firstspawn/typescript-config`: Shared TS configurations
- `@firstspawn/config`: Shared ESLint configuration

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/firstspawn/firstspawn-monorepo/issues)
- 💬
  [Discussions](https://github.com/firstspawn/firstspawn-monorepo/discussions)

---

Built with passion by the FirstSpawn team
