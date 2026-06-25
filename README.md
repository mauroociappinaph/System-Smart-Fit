# System Smart Fit

**An event-driven, AI-powered health and fitness platform with a hexagonal architecture, multi-agent orchestration, and adaptive user state management.**

System Smart Fit is a full-stack platform that ingests biometric telemetry from wearable devices, processes health data through a collaborative multi-agent AI system, and delivers personalized fitness, nutrition, and recovery recommendations. The architecture is designed for long-term maintainability, semantic memory retrieval, and autonomous adaptation to each user's physiological profile.

---

## Key Features

- **Multi-Agent AI Orchestration** — A coordinated ecosystem of six specialized AI agents (Orchestrator, Health Data, AI Insight, Risk & Alert, Progress Analysis, Validation/Critic) that process biometric data and generate validated recommendations.
- **Adaptive User State Machine** — A finite state machine (FSM) with six states (Idle, Active Tracking, Improvement, Stagnation, Risk, Recovery) that dynamically adjusts system behavior based on user progress and biomarkers.
- **Event-Driven Immutable Core** — All domain events (HealthDataRecorded, WeightUpdated, SleepAnalyzed, InsightGenerated, etc.) are immutable, versioned, and traceable via unique correlation IDs.
- **Hierarchical Memory System** — Three-tier memory architecture: short-term (Redis, <5ms latency), medium-term (aggregated metrics), and long-term (vector embeddings via pgvector with HNSW indexing).
- **Semantic Caching** — Redis-based vector similarity cache reduces NVIDIA NIM inference costs by serving semantically equivalent responses within a configurable time window.
- **Defensive Security** — JWT dual-token auth (HttpOnly, Secure, SameSite=Strict), Role-Based Access Control (RBAC), Zod payload validation, Helmet headers, and dynamic rate limiting.
- **Automated Quality Gates** — Husky pre-commit hooks (ESLint + Prettier via lint-staged), commitlint enforcement, and CI/CD pipelines with mandatory 80% global / 95% domain code coverage.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js (App Router) + TypeScript | Hybrid SSR/CSR rendering, file-based routing |
| **State Management** | Zustand | Lightweight global state with minimal re-render overhead |
| **Backend** | NestJS + TypeScript | Modular, hexagonal architecture with native DI |
| **Database** | Supabase PostgreSQL + pgvector | Relational persistence + vector embeddings (HNSW index) |
| **Cache** | Redis | Short-term memory, semantic cache, session management |
| **AI Inference** | NVIDIA NIM (Nemotron-3 models) | High-performance, hardware-accelerated LLM inference |
| **Observability** | OpenTelemetry + Jaeger/Zipkin | Distributed tracing, correlation ID propagation |
| **CI/CD** | GitHub Actions | Automated lint, test, build, deploy pipelines |
| **Containerization** | Docker Compose | Local development environment orchestration |

---

## Architecture Overview

### Hexagonal Architecture (Ports & Adapters)

The system is organized into concentric layers where dependencies flow inward toward the domain core:

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation Layer (Next.js ←→ NestJS REST Controllers)   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Input Ports (Application Use Cases)                        │
│  - Telemetry Ingestion  - AI Processing                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Domain Core                                                │
│  - Health Entities  - Immutable Events  - State Transitions│
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │
┌─────────────────────────────────────────────────────────────┐
│  Output Ports (Interfaces)                                  │
│  IEventPublisher · IScalableRepository · IAgentMemory · ... │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Infrastructure Layer                                       │
│  PostgreSQL/pgvector · Redis · NVIDIA NIM · Event Bus      │
└─────────────────────────────────────────────────────────────┘
```

### Event-Driven Core

Every state change is recorded as an immutable domain event with four mandatory properties:

| Property | Description |
|----------|-------------|
| **Immutability** | Once persisted, events cannot be altered or deleted |
| **Semantic Versioning** | Each event schema carries a version prefix for evolvability |
| **Idempotency** | Unique event IDs + timestamps prevent duplicate processing |
| **Correlation ID** | End-to-end trace ID propagated across all services and inferences |

### Multi-Agent System

```
[Sensor Data] → (1. Telemetry Ingestion) → HealthDataRecorded Event
                                                  │
                                                  ▼
[Event Bus] ← (2. Data Normalization) ← Health Data Agent
     │
     ├──→ [Orchestrator Agent] → (3. Parallel Analysis)
     │                                │
     │            ┌───────────────────┴───────────────────┐
     │            │                                       │
     │            ▼                                       ▼
     │   Risk & Alert Agent                   Progress Analysis Agent
     │   (Danger Evaluation)                  (Trend Calculation)
     │            │                                       │
     │            └───────────────────┬───────────────────┘
     │                                │
     │                          (4. Guidance Generation) → AI Insight Agent
     │                                                      │
     │                          (5. Safety Audit) → Validation Agent
     │                                                      │
     └──→ (6. Insight Publication) ────────────────────────┘
                                          │
                                          ▼
                              [Frontend React Dashboard]
```

**Agent coordination rules:**
- Agents share a single centralized memory — no isolated local state
- Only the Orchestrator Agent can delegate tasks between specialists
- All user-facing outputs require Validation/Critic Agent approval
- Maximum 3 correction iterations before fallback to deterministic responses

### User State Machine (FSM)

```
┌─────────────────────────────────────────────────────┐
│                   USER STATE MACHINE                 │
│                                                     │
│   Idle ──→ Active Tracking ──→ Improvement Phase    │
│    ▲            │    │               │               │
│    │            │    │               ▼               │
│    │            │    └──→ Stagnation Phase           │
│    │            │                    │               │
│    │            ▼                    ▼               │
│    └──── Recovery Phase ←── Risk Phase              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Transition rules** (simplified):
- **Idle → Active Tracking**: 5 consecutive days of biometric data
- **Active Tracking → Improvement**: ≥5% sustained week-over-week improvement
- **Active Tracking → Stagnation**: 14 days of flat or negative progress
- **Active Tracking → Risk**: Immediate on AlertTriggered (critical severity)
- **Improvement → Recovery**: 3+ days of declining nocturnal HRV
- **Stagnation → Improvement**: 3 days of positive biometric trends
- **Risk → Recovery**: 48+ hours of stabilized risk markers
- **Recovery → Active Tracking**: Full recovery confirmed by HRV/sleep scores (or 7 calendar days)

---

## Project Structure

```
smart-fit/
├── frontend/                          # Next.js application
│   ├── app/                           # App Router (layouts, pages)
│   ├── components/                    # Shared UI components
│   ├── features/                      # Domain feature modules
│   ├── hooks/                         # Custom React hooks
│   ├── services/                      # API clients (NestJS, Supabase)
│   ├── store/                         # Zustand stores
│   ├── types/                         # TypeScript interfaces
│   ├── lib/                           # Library initialization
│   ├── utils/                         # Pure utility functions
│   ├── constants/                     # Static values and ranges
│   ├── tests/                         # Test suites
│   │   ├── unit/                      # Component unit tests
│   │   ├── integration/               # Feature integration tests
│   │   └── e2e/                       # Playwright E2E tests
│   ├── mocks/                         # Synthetic test data
│   ├── providers/                     # React context providers
│   ├── middleware.ts                  # JWT session validation
│   └── config/                        # Next.js configuration
│
├── backend/                           # NestJS application
│   ├── domain/                        # Domain core (entities, ports, events)
│   ├── application/                   # Use cases, input ports
│   ├── infrastructure/                # Adapters (DB, NIM, Redis, Event Bus)
│   ├── presentation/                  # REST controllers, DTOs
│   ├── shared/                        # Cross-cutting utilities
│   ├── config/                        # Environment configuration
│   ├── database/                      # Migrations, seeds
│   ├── modules/                       # NestJS DI modules
│   └── tests/                         # Test suites
│       ├── unit/                      # Domain + use case tests
│       ├── integration/               # Repository, service, controller tests
│       └── e2e/                       # Supertest API integration tests
│
├── .husky/                            # Git hooks
│   ├── pre-commit                     # lint-staged
│   ├── commit-msg                     # commitlint
│   └── pre-push                       # Unit + persistence tests
│
├── .github/workflows/                 # CI/CD pipelines
│   ├── lint.yml                       # ESLint + Prettier
│   ├── frontend-tests.yml             # Unit + Zustand + Playwright
│   ├── backend-tests.yml              # Unit + repository integration
│   ├── build.yml                      # TypeScript compilation
│   └── deploy.yml                     # Production deployment
│
├── docker-compose.yml                 # Local infrastructure
└── README.md
```

---

## Installation

### Prerequisites

- Node.js >= 20
- npm / yarn / pnpm
- Docker & Docker Compose
- NVIDIA NIM API key ([register here](https://build.nvidia.com))
- Supabase account (local or hosted)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/mauroociappinaph/System-Smart-Fit.git
cd smart-fit

# 2. Install dependencies
cd frontend && npm install
cd ../backend && npm install
cd ..

# 3. Start local infrastructure (PostgreSQL + pgvector, Redis)
docker compose up -d

# 4. Run database migrations
cd backend && npm run db:migrate && cd ..

# 5. Seed the database with initial data
cd backend && npm run db:seed && cd ..

# 6. Start development servers
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

---

## Environment Configuration

Create `.env` files in both `frontend/` and `backend/` directories:

### Backend (`backend/.env`)

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key

# Redis
REDIS_URL=redis://localhost:6379

# NVIDIA NIM
NIM_API_KEY=your_nim_api_key
NIM_BASE_URL=https://api.nvcf.nvidia.com/v2/nvcf

# JWT
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# OpenTelemetry
OTEL_EXPORTER_OTLP_ENDPOINT=your_otel_collector_endpoint
```

### Frontend (`frontend/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Development** | | |
| `dev:infrastructure` | `docker compose up -d` | Start PostgreSQL, Redis, and cache containers |
| `dev` | `npm run dev` (in each package) | Start development servers with hot reload |
| **Quality** | | |
| `lint:apply` | `npm run lint -- --fix` | Auto-fix ESLint and Prettier issues |
| `lint:check` | `npm run lint` | Check code style without modifications |
| **Testing** | | |
| `test:run` | `npm run test` | Run all unit + integration tests |
| `test:coverage` | `npm run test -- --coverage` | Run tests with coverage report |
| `test:e2e` | `npm run test:e2e` | Run Playwright E2E tests (frontend) |
| **Database** | | |
| `db:migrate` | `npm run db:migrate` | Apply pending migrations |
| `db:seed` | `npm run db:seed` | Populate database with seed data |
| `db:rollback` | `npm run db:rollback` | Rollback the last migration |
| **Build** | | |
| `build:all` | `npm run build` (in each package) | Strict TypeScript compilation |
| **AI Engine** | | |
| `ai:cache:purge` | `npm run ai:cache:purge` | Clear Redis semantic cache |
| **Monitoring** | | |
| `telemetry:export` | `npm run telemetry:export` | Manual OpenTelemetry trace export check |

---

## Testing Strategy

The platform follows a disciplined testing pyramid with strict coverage thresholds enforced in CI/CD:

| Layer | Type | Tool | Threshold |
|-------|------|------|-----------|
| **Domain Core** | Unit (entities, rules) | Jest | ≥95% |
| **Application** | Unit (use cases) | Jest | ≥85% |
| **Infrastructure** | Integration (repositories, adapters) | Jest + Supertest | — |
| **Presentation** | Controller (routes, DTOs, responses) | Supertest | — |
| **Frontend** | Unit (components, hooks, stores) | Jest + Testing Library | — |
| **Frontend** | E2E (user flows) | Playwright | — |

**Global minimum coverage: 80%** across the entire monorepo.

---

## CI/CD Pipeline

```
Push / PR to protected branch
         │
    ┌────┴────┐
    │         │
 lint.yml  frontend-tests.yml  backend-tests.yml
 (ESLint)  (Unit + Playwright) (Unit + Repository)
    │         │
    └────┬────┘
         ▼
   All checks pass?
         │
    Yes──┴──No → Abort
         │
    build.yml
    (Strict TypeScript compilation)
         │
         ▼
    deploy.yml (main branch only)
    - Backend deployment
    - Frontend deployment
    - Database migrations
```

Each pipeline run also includes:
- **Dependency audit** (npm audit) — blocks on high/critical vulnerabilities
- **SAST analysis** (CodeQL) — memory safety and logic risk detection
- **Coverage report** — enforces minimum thresholds before merge

---

## Git Workflow

### Branch Strategy (Trunk-Based Development)

| Branch | Purpose |
|--------|---------|
| `main` | Production — protected, no direct writes |
| `develop` | Integration branch for approved features |
| `feature/*` | Short-lived (≤48h) feature development branches |
| `hotfix/*` | Urgent production fixes |
| `release/*` | Pre-production release preparation |

### Commit Convention (Conventional Commits)

```
feat:     New feature (e.g., NVIDIA NIM adapter)
fix:      Bug fix
docs:     Documentation only
style:    Formatting (no functional change)
refactor: Code restructuring (no feature or fix)
test:     Adding or improving tests
chore:    Maintenance, dependency updates
```

### Pull Request Standards

- **Max 300 net lines** per PR for efficient review
- **Required**: 1+ senior engineer approval
- **Required**: All CI checks pass
- **Required**: Coverage thresholds maintained
- **Required**: Hexagonal architecture respected (no domain leaks)

---

## Roadmap

| Phase | Key Deliverables | Accepted Tech Debt |
|-------|-----------------|-------------------|
| **MVP** | Manual weight/calorie/heart rate entry. Limited FSM (Idle, Active Tracking). Basic AI insights via Nemotron-3-Super-120B. | No partitioning, no semantic cache, 75% test coverage |
| **V1** | Wearable API sync. Full FSM. Complete 6-agent system. pgvector + HNSW for long-term memory. | Sequential agent pipeline, local structured logs |
| **V2** | Real-time HRV sync. Nemotron-3-Ultra-550B for expert validation. Semantic caching with Redis. Async concurrent processing with elastic queues. | Relaxed eventual consistency for mobile, linear stagnation analysis |
| **V3** | Predictive body composition simulation. Continuous self-adaptive prompt tuning. Immune susceptibility predictions from HRV telemetry. OpenTelemetry-enriched distributed tracing. | Legacy model maintenance in historical data bus |

---

## Software Engineering Principles Applied

- **Single Responsibility Principle (SRP)** — Each class, use case, and agent has one operational responsibility
- **Open/Closed Principle (OCP)** — New sensor integrations via output adapters, no domain changes
- **Liskov Substitution (LSP)** — Any adapter can replace another at an interface boundary
- **Interface Segregation (ISP)** — Atomic infrastructure ports; no method is forced on an adapter that doesn't need it
- **Dependency Inversion (DIP)** — Domain depends only on abstract interfaces; NestJS DI injects concrete implementations
- **Don't Repeat Yourself (DRY)** — Metabolic rate formulas, fatigue estimations, and biometric normalizations defined once in the shared domain
- **Defense in Depth** — Rate limiting, Zod validation, Helmet headers, RBAC, double-token JWT, encrypted cookies, and Policy as Code guardrails

---

## Author

Not specified in the original documentation.

---

## License

Not specified in the original documentation.