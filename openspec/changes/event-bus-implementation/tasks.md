# Tasks: Event Bus Implementation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 800-1000 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Phase 4.1-4.2 (Foundation + Outbox) → PR 2: Phase 4.3 (Worker) → PR 3: Phase 4.4 (Use Case Wiring) → PR 4: Phase 4.5 (Tests) |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Port/Adapter + Outbox Schema/Repository | PR 1 | Foundation layer; no runtime behavior changes |
| 2 | Outbox Relay Worker | PR 2 | Background worker; can be feature-flagged off |
| 3 | Use Case Wiring + Domain Events | PR 3 | Connects use cases to event bus; enables publishing |
| 4 | Tests (Unit + Integration + E2E) | PR 4 | Verification; depends on all prior work |

---

## Phase 4.1: Port + Adapter (Foundation)

- [ ] **TASK-001** Create `src/shared/ports/out/event-bus.port.ts` with `EventBusPort` interface (`publish`, `publishAll` methods accepting `DomainEvent<T>`)
- [ ] **TASK-002** Create `src/infrastructure/events/nestjs-event-emitter.adapter.ts` implementing `EventBusPort` using `@nestjs/event-emitter` EventEmitter2
- [ ] **TASK-003** Create `src/infrastructure/events/event-bus.module.ts` wiring `NestjsEventEmitterAdapter` as `EventBusPort` provider
- [ ] **TASK-004** Write unit tests in `src/infrastructure/events/__tests__/nestjs-event-emitter.adapter.spec.ts` — mock EventEmitter2, verify `emit` called with correct event name and payload

---

## Phase 4.2: Outbox Schema + Repository

- [ ] **TASK-005** Add `EventOutbox` model and `EventOutboxStatus` enum to `prisma/schema.prisma` with indexes on `[status, createdAt]` and `[correlationId]`
- [ ] **TASK-006** Run `prisma migrate dev --name add-event-outbox` to generate migration
- [ ] **TASK-007** Create `src/shared/ports/out/outbox-repository.port.ts` with `OutboxRepositoryPort` interface (`saveInTransaction`, `findPendingBatch`, `markPublished`, `markFailed`, `moveToDeadLetter`)
- [ ] **TASK-008** Create `src/infrastructure/persistence/outbox-prisma.repository.ts` implementing `OutboxRepositoryPort` using PrismaService
- [ ] **TASK-009** Write unit tests in `src/infrastructure/persistence/__tests__/outbox-prisma.repository.spec.ts` — mock PrismaService, verify correct queries for each method

---

## Phase 4.3: Outbox Relay Worker

- [ ] **TASK-010** Create `src/infrastructure/events/outbox.module.ts` registering `OutboxRepositoryPort` provider and importing `EventBusModule`
- [ ] **TASK-011** Create `src/infrastructure/workers/outbox-relay.worker.ts` with `@Cron(EVERY_30_SECONDS)` processor, batch size 100, exponential backoff (base 1000ms, max 5 retries), dead-letter handling
- [ ] **TASK-012** Implement `deserializeEvent` helper to reconstruct `DomainEvent` from `EventOutbox` record
- [ ] **TASK-013** Add structured logging (success, retry, dead-letter) using NestJS Logger
- [ ] **TASK-014** Write integration tests in `test/integration/outbox-relay.worker.integration.spec.ts` — Testcontainers PostgreSQL, verify PENDING → PUBLISHED flow, retry logic, DLQ transition

---

## Phase 4.4: Use Case Wiring

- [ ] **TASK-015** Create `src/domain/events/health-telemetry-recorded.event.ts` with `HealthTelemetryRecordedPayload` interface and `HealthTelemetryRecorded` class implementing `DomainEvent`
- [ ] **TASK-016** Modify `src/domain/events/user-state-transitioned.event.ts` — add `correlationId` to `UserStateTransitionedPayload`
- [ ] **TASK-017** Modify `src/application/use-cases/record-state-transition.service.ts` — inject `EventBusPort` and `OutboxRepositoryPort`, save event to outbox within Prisma transaction alongside entity
- [ ] **TASK-018** Modify `src/application/use-cases/record-health-telemetry.service.ts` — inject `EventBusPort` and `OutboxRepositoryPort`, create `HealthTelemetryRecorded` event, save to outbox in transaction
- [ ] **TASK-019** Update `src/modules/user-state/user-state.module.ts` to import `EventBusModule` and `OutboxModule`, provide `OutboxRepositoryPort`
- [ ] **TASK-020** Update `src/modules/health-telemetry/health-telemetry.module.ts` to import `EventBusModule` and `OutboxModule`, provide `OutboxRepositoryPort`
- [ ] **TASK-021** Modify `src/app.module.ts` to import `EventBusModule` and `OutboxModule` globally

---

## Phase 4.5: Testing

- [ ] **TASK-022** Write unit tests for `RecordStateTransitionService` — mock repositories and EventBusPort, verify transaction calls and event publishing
- [ ] **TASK-023** Write unit tests for `RecordHealthTelemetryService` — mock repositories and EventBusPort, verify `HealthTelemetryRecorded` event creation and publishing
- [ ] **TASK-024** Write integration test: HTTP POST → Use Case → Outbox (PENDING) → Worker → EventEmitter (published) — using Supertest + real modules
- [ ] **TASK-025** Write E2E test for `record-state-transition` endpoint — verify response includes event, outbox row created, worker publishes
- [ ] **TASK-026** Write E2E test for `record-health-telemetry` endpoint — verify `HealthTelemetryRecorded` event flow
- [ ] **TASK-027** Create test fixtures/utilities in `test/fixtures/events.ts` — helper functions to create valid domain events, commands, and expected payloads
- [ ] **TASK-028** Add feature flag `EVENT_BUS_ENABLED` and `OUTBOX_WORKER_ENABLED` to `.env.example` and config, gate publishing/worker behind flags

---

## Phase 4.6: Cleanup & Documentation

- [ ] **TASK-029** Update `README.md` with Event Bus architecture overview and deployment notes
- [ ] **TASK-030** Add JSDoc comments to all new public interfaces and classes
- [ ] **TASK-031** Verify linting passes (`pnpm lint`) and all tests pass (`pnpm test`)