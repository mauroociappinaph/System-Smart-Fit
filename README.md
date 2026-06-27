# System Smart Fit

**Backend de plataforma de salud y fitness con arquitectura hexagonal.**

Sistema para ingesta de telemetría biométrica, gestión de estados de usuario y almacenamiento de insights generados. Construido con NestJS + Prisma + Supabase (PostgreSQL + pgvector) siguiendo Arquitectura Hexagonal (Puertos y Adaptadores).

---

## Estado Actual

El proyecto está en **desarrollo activo**. Backend funcional con arquitectura hexagonal sólida, persistencia en **Supabase (PostgreSQL)**, y frontend **Next.js en producción** con autenticación, dashboard, insights y filtros por mes/rango de fechas.

---

## Lo que existe hoy

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| **HealthTelemetry** | ✅ Completo | Ingesta de métricas biométricas (peso, calorías, HR, sueño) |
| **User** | ✅ Completo | CRUD de usuarios perfil atlético |
| **UserState** | ✅ Completo | Máquina de estados (FSM) con persistencia y transiciones |
| **AgentInsight** | ✅ Completo | Insights generados con flujo de validación (approve/reject/discard) |
| **Auth** | ✅ Completo | Login con email/contraseña + JWT + refresh token + guards |
| **Frontend** | ✅ Funcional | Next.js 15 con login, dashboard, insights con filtros (mes / rango fechas) + refresh |

---

## Tech Stack Actual

| Capa | Tecnología |
|------|-----------|
| **Backend** | NestJS 11 + TypeScript |
| **Frontend** | Next.js 15 + React 19 + Zustand + Tailwind CSS |
| **Base de datos** | Supabase (PostgreSQL 16 + pgvector) + Prisma ORM 7 |
| **Validación** | class-validator + class-transformer |
| **Testing** | Jest 30 + Supertest (backend) + Vitest (frontend) |

---

## Arquitectura

El backend sigue **Arquitectura Hexagonal (Ports & Adapters)** con dependencias hacia adentro:

```
┌──────────────────────────────────────────────┐
│  Presentation Layer (REST Controllers, DTOs)  │
└──────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Application Layer (Use Cases)                │
└──────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Domain Layer (Entities, Ports, Events)       │
└──────────────────────────────────────────────┘
                       ▲
                       │
┌──────────────────────────────────────────────┐
│  Infrastructure Layer (Prisma Adapters)       │
└──────────────────────────────────────────────┘
```

### Modelos de datos

Cuatro modelos en Prisma:

| Modelo | Propósito | Índices |
|--------|-----------|---------|
| `User` | Perfil de usuario (nombre, peso, altura, goal) | id |
| `HealthTelemetry` | Métricas biométricas crudas | userId, metricType, correlationId |
| `UserState` | Historial de transiciones FSM | userId, currentState |
| `AgentInsight` | Insights con estado de validación | userId, validationStatus |

---

## Supabase

La base de datos corre en **Supabase** (PostgreSQL 16 administrado), con dos modalidades de conexión:

| Conexión | Puerto | Uso |
|----------|--------|-----|
| **Pooled (PgBouncer)** | `6543` | App en ejecución (transacciones concurrentes) |
| **Direct** | `5432` | Prisma Migrate (migraciones de schema) |

### Proyecto activo

- **Project ref:** `bvojmrveoppjoyucdfpd`
- **Región:** AWS US East 1
- **Extensiones:** `pgvector` habilitado para búsqueda semántica
- **Migraciones aplicadas:** 2 (`add_user_state`, `add_agent_insight`)

### MCP

El proyecto tiene el MCP de Supabase configurado en `opencode.json` para interactuar con la base de datos directamente desde el agente.

---

## Estructura del Proyecto

```
Fitt/
├── backend/
│   ├── src/
│   │   ├── domain/            # Entidades, puertos, eventos
│   │   │   ├── entities/      # User, UserState, AgentInsight, etc.
│   │   │   ├── ports/         # Interfaces de repositorio
│   │   │   └── events/        # Eventos de dominio
│   │   ├── application/       # Casos de uso (8 implementados)
│   │   │   └── use-cases/     # Servicios de aplicación
│   │   ├── infrastructure/    # Adaptadores Prisma
│   │   │   └── persistence/   # Repositorios concretos
│   │   └── presentation/      # Controladores REST + DTOs
│   │       └── controllers/   # Rutas HTTP
│   ├── prisma/
│   │   └── schema.prisma      # Schema de base de datos
│   └── test/                  # Tests E2E
├── frontend/                  # Next.js 15 (login, dashboard, insights)
├── planCompleto.md            # Visión arquitectónica completa
└── ROADMAP.md                 # Plan de desarrollo
```

---

## Tests

**105 tests pasando** (93 backend + 12 frontend), 22 suites, 0 fallos.

```bash
# Backend
cd backend && npm run test

# Frontend
cd frontend && npm run test
```

| Capa | Framework | Cobertura |
|------|-----------|-----------|
| Backend — Unitarios (entidades + use cases) | Jest | ✓ |
| Backend — Integración (repositorios) | Jest | ✓ |
| Backend — Controladores (REST) | Supertest | ✓ |
| Frontend — Stores (Zustand) | Vitest | ✓ |
| Frontend — Componentes | Vitest + React Testing Library | ✓ |

---

## Requisitos

- Node.js >= 20
- npm
- Supabase project (crear en [supabase.com](https://supabase.com))

### Inicio rápido

```bash
cd backend
cp .env.example .env        # Configurar DATABASE_URL con tus credenciales de Supabase
npm install                 # Instalar dependencias
npx prisma db push          # Sincronizar schema (si arrancás de cero)
npm run test                # Verificar que todo funciona
npm run start:dev           # Iniciar servidor
```

> **Nota sobre la conexión a Supabase:** La app usa el puerto **pooled (6543)** con PgBouncer. Para migraciones (Prisma Migrate) necesitás la conexión **directa (puerto 5432)**. Ver `backend/.env` para ambos strings. Las migraciones ya están aplicadas en el proyecto de Supabase activo.

---

## Roadmap

Ver [ROADMAP.md](./ROADMAP.md) para el plan de desarrollo detallado con fases, prioridades y dependencias.
