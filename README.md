# System Smart Fit

**Backend de plataforma de salud y fitness con arquitectura hexagonal.**

Sistema para ingesta de telemetría biométrica, gestión de estados de usuario y almacenamiento de insights generados. Construido con NestJS + Prisma + Supabase (PostgreSQL + pgvector) siguiendo Arquitectura Hexagonal (Puertos y Adaptadores).

---

## Estado Actual

El proyecto está en **desarrollo activo**. El backend es funcional con una arquitectura hexagonal sólida, tests unitarios y de integración, y persistencia real con **Supabase (PostgreSQL)**. El frontend está scaffolded pero aún sin implementar.

---

## Lo que existe hoy

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| **HealthTelemetry** | ✅ Completo | Ingesta de métricas biométricas (peso, calorías, HR, sueño) |
| **User** | ✅ Completo | CRUD de usuarios perfil atlético |
| **UserState** | ✅ Completo | Máquina de estados (FSM) con persistencia y transiciones |
| **AgentInsight** | ✅ Completo | Insights generados con flujo de validación (approve/reject/discard) |
| **Auth** | ❌ Pendiente | Sin autenticación implementada |
| **Frontend** | ❌ Scaffold vacío | Next.js instalado sin lógica de negocio |

---

## Tech Stack Actual

| Capa | Tecnología |
|------|-----------|
| **Backend** | NestJS 11 + TypeScript |
| **Base de datos** | Supabase (PostgreSQL 16 + pgvector) + Prisma ORM 7 |
| **Validación** | class-validator + class-transformer |
| **Testing** | Jest 30 + Supertest |

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
├── frontend/                  # Next.js (scaffold)
├── planCompleto.md            # Visión arquitectónica completa
└── ROADMAP.md                 # Plan de desarrollo
```

---

## Tests

**61 tests pasando**, 15 suites, 0 fallos.

```bash
cd backend && npm run test
```

| Tipo | Framework | Cobertura |
|------|-----------|-----------|
| Unitarios (entidades + use cases) | Jest | ✓ |
| Integración (repositorios) | Jest | ✓ |
| Controladores (REST) | Supertest | ✓ |

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
