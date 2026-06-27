# Changelog

Todas los cambios notables documentados aquí.

Formato: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versionado: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [1.1.0] - 2026-06-27

### Added
- **Root README**: Reescrito con cognitive-doc-design (quick start, arquitectura, stack, testing, docker, docs index)
- **Migración npm → pnpm**: Workspaces configurados, `pnpm-workspace.yaml`, lockfiles migrados
- **Husky v9 + lint-staged v15**: Pre-commit hooks con prettier + eslint en root workspace
- **Docker Compose dev**: `docker-compose.yml` con backend (3001) + frontend (3000) usando Supabase remoto
- **Dockerfiles**: Backend + Frontend con Node 20 Alpine (Prisma 7.8+ compatible)
- **pnpm workspace**: Root `package.json` con workspaces `backend` + `frontend`

### Changed
- **Root README**: Reescrito siguiendo cognitive-doc-design (quick start, tablas, progressive disclosure)
- **Root package.json**: Migrado a pnpm workspaces + Husky v9 + lint-staged v15 + prettier
- **CHANGELOG**: Formato Keep a Changelog mejorado con tablas y categorías claras
- **Package manager**: npm → pnpm (workspaces, mejor performance, disk efficiency)

### Infrastructure
- **Monorepo**: pnpm workspaces (`backend`, `frontend`)
- **Git Hooks**: Husky v9 + lint-staged v15 + prettier en pre-commit
- **Docker Dev**: Compose 2 servicios (backend 3001, frontend 3000) + Supabase remoto
- **Package Manager**: pnpm 10.x (workspaces, cache, disk efficiency)

### Fixed
- **Dockerfiles**: Node 20 Alpine para compatibilidad Prisma 7.8+
- **lint-staged**: Config en root `package.json` (sin `.lintstagedrc` separado)
- **Husky hook**: `npx lint-staged --config package.json` (sin `--no-install` deprecado)

---

## [1.0.0] - 2026-06-27

### Added
- **Frontend Documentation**: Rewrite completo `frontend/README.md` (overview, features, tech stack, estructura, env, rutas, scripts, testing, quick start, auth flow, API integration, design, troubleshooting)
- **Docker Support**: `docker-compose.yml` para desarrollo local (backend 3001 + frontend 3000) con Supabase remoto
- **Backend Dockerfile**: Node 20 Alpine multi-stage compatible Prisma 7.8+
- **Frontend Dockerfile**: Node 20 Alpine multi-stage compatible Next.js 15+
- **Root Package.json**: Workspace config npm + Husky v9 + lint-staged v15
- **SDD Docs**: Exploration, proposal, spec para Docker Compose

### Changed
- **Frontend README**: Rewrite completo (match backend documentation standard)
- **Backend README**: Actualizado con documentación comprehensiva

### Infrastructure
- **Monorepo Setup**: npm workspaces (backend + frontend)
- **Git Hooks**: Husky v9 + lint-staged v15 configurado para pre-commit

---

## [0.1.0] - 2026-06-25

### Added
- **Backend Inicial**: NestJS + Prisma + Supabase
- **Frontend Inicial**: Next.js 15 + React 19 + Zustand + Tailwind CSS
- **Auth**: Login/Register JWT + Magic Links
- **Dashboard**: Health telemetry (insights list + approve/reject)
- **Telemetría**: Formulario biométrico (HR, BP, peso, glucosa, sueño, pasos)
- **Zustand Stores**: Auth + Insights
- **Tests**: 12 unit tests frontend pasando

### Security
- JWT auth con Supabase
- Rutas protegidas con AuthGuard
- Configuración basada en entorno

---

### Tipos de Cambios
- `Added` — Nueva funcionalidad
- `Changed` — Cambios en funcionalidad existente
- `Deprecated` — Funcionalidad que se eliminará
- `Removed` — Funcionalidad eliminada
- `Fixed` — Corrección de bugs
- `Security` — Correcciones de vulnerabilidades