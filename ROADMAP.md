# Roadmap — System Smart Fit

> Plan de desarrollo concreto. Cada fase tiene un objetivo claro, entregables específicos, y un criterio de "done".
>
> La visión completa está en [`planCompleto.md`](./planCompleto.md). Este archivo es el **plan de ejecución**.

---

## Fase 1: Auth y endpoints faltantes

**Objetivo:** Que el backend sirva para algo real — un usuario puede registrarse, autenticarse y acceder a sus datos.

| Item | Esfuerzo | Dependencias |
|------|----------|-------------|
| Login con email/contraseña + JWT | Media | - |
| Proteger endpoints existentes con Guards | Baja | Auth |
| Refresh token básico | Baja | Auth |
| Endpoint `GET /users/me` | Baja | Auth |
| Tests de auth (login, refresh, protected routes) | Media | Auth |

**✅ Done cuando:** Un usuario puede registrarse, loguearse, y acceder a sus endpoints con un token JWT. Tests pasando.

---

## Fase 2: Frontend MVP

**Objetivo:** Que la app tenga interfaz visual — login, dashboard, visualización de datos.

| Item | Esfuerzo | Dependencias |
|------|----------|-------------|
| Login/registro | Media | Fase 1 |
| Dashboard con health telemetry (listar métricas) | Media | Fase 1 |
| Visualización de insights (listar + approve/reject) | Media | Fase 1 |
| Zustand stores para auth y datos | Baja | - |
| Tests unitarios + Playwright E2E básico | Media | - |

**✅ Done cuando:** Un usuario puede loguearse, ver sus métricas biométricas y sus insights, y aprobar/rechazar insights. Tests pasando.

---

## Fase 3: Infraestructura y DX

**Objetivo:** Que el proyecto sea reproducible y tenga calidad garantizada en cada commit.

| Item | Esfuerzo | Dependencias |
|------|----------|-------------|
| Docker Compose (PostgreSQL + backend) | Baja | - |
| Husky + lint-staged (pre-commit lint + format) | Baja | - |
| CI/CD básico (GitHub Actions: lint + test + build) | Media | - |
| Scripts de inicio rápido (`make dev` o similar) | Baja | Docker |

**✅ Done cuando:** `git clone && docker compose up` levanta todo. Cada commit ejecuta lint. Cada PR ejecuta tests en CI.

---

## Fase 4: Event Bus y persistencia de eventos

**Objetivo:** Desacoplar módulos vía eventos — base para el multi-agente.

| Item | Esfuerzo | Dependencias |
|------|----------|-------------|
| Tabla `domain_events` en Prisma | Baja | - |
| IEventPublisher + EventStore (Prisma adapter) | Media | - |
| Publicar eventos existentes (HealthDataRecorded, InsightGenerated, etc.) | Media | - |
| Correlation ID propagation obligatorio | Baja | - |

**✅ Done cuando:** Cada operación de escritura publica un evento inmutable. Se pueden leer eventos por correlationId. Tests.

---

## Fase 5: AI Integration (primera iteración)

**Objetivo:** Que el sistema genere insights reales vía LLM — sin multi-agente todavía.

| Item | Esfuerzo | Dependencias |
|------|----------|-------------|
| OpenAI API wrapper (o cualquier LLM, no NIM todavía) | Media | Fase 4 |
| Primer agente simple: dado health telemetry → genera insight | Media | Fase 4 |
| Guardar insight generado en `agent_insights` | Baja | Fase 1 |
| Tests con mock del LLM | Media | - |

**✅ Done cuando:** Al enviar health telemetry, el sistema genera un insight vía LLM y lo persiste. Tests.

---

## Fase 6: Multi-agente, memoria y caching

**Objetivo:** Implementar la visión de `planCompleto.md` — el sistema completo con agentes, memoria vectorial y caché semántica.

| Item | Esfuerzo | Dependencias |
|------|----------|-------------|
| Redis (docker + adapter) | Media | Fase 3 |
| pgvector + HNSW (shared_memories) | Media | Fase 3 |
| Orchestrator Agent (coordinación entre agentes) | Alta | Fase 5 |
| Risk & Alert Agent | Media | Fase 5 |
| Validation Agent | Media | Fase 5 |
| Semantic caching con Redis | Media | Redis |
| Tests de integración multi-agente | Alta | Todo lo anterior |

**✅ Done cuando:** El sistema completo de `planCompleto.md` está implementado. Salud del proyecto: 80%+ cobertura, CI/CD verde, docker compose funcional.

---

## Resumen visual

```
Fase 1 ──→ Fase 2 ──→ Fase 3 ──→ Fase 4 ──→ Fase 5 ──→ Fase 6
(Auth)    (Frontend)  (Infra)    (Events)   (AI)       (Full)
                                                       ▲
                                                       │
                                              planCompleto.md
```

Cada fase es **independiente** y se puede pausar. El orden maximiza valor entregado vs. esfuerzo: las fases tempranas desbloquean valor real rápido, las tardías implementan la visión completa.
