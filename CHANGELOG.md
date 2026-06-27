# Changelog

All

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-27

### Added
- **Frontend Documentation**: Complete rewrite of `frontend/README.md` with project overview, features, tech stack, project structure, environment configuration, routes, scripts, testing guide, quick start, authentication flow, API integration, design principles, requirements, troubleshooting, and resources
- **Docker Support**: Added `docker-compose.yml` for local development with backend (port 3001) and frontend (port 3000) services using Supabase remote database
- **Backend Dockerfile**: Multi-stage Node 20 Alpine image compatible with Prisma 7.8+
- **Frontend Dockerfile**: Multi-stage Node 20 Alpine image compatible with Next.js 15+
- **Root Package.json**: Workspace configuration with Husky v9 and lint-staged v15 for monorepo management
- **SDD Documentation**: Exploration, proposal, and specification documents for Docker Compose implementation

### Changed
- **Documentation**: Frontend README completely rewritten to match backend documentation standard
- **Backend README**: Previously updated with comprehensive project documentation

### Infrastructure
- **Monorepo Setup**: Root package.json with npm workspaces for backend/frontend
- **Git Hooks**: Husky v9 + lint-staged v15 configured for pre-commit validation

## [0.1.0] - 2026-06-25

### Added
- Initial backend with NestJS, Prisma, Supabase
- Initial frontend with Next.js 15, React 19, Zustand, Tailwind CSS
- Authentication (login/register with JWT)
- Health telemetry dashboard (insights list + approve/reject)
- Biometric telemetry submission form
- Zustand stores for auth and insights
- 12 unit tests passing

### Security
- JWT authentication with Supabase
- Protected routes with AuthGuard
- Environment-based configuration

---

### Types of changes
- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes