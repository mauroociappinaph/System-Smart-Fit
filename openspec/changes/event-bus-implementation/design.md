# Design: Event Bus Implementation

## Technical Approach

This design implements a reliable event bus using the **Transactional Outbox Pattern** with NestJS EventEmitter2. Domain events are persisted to an `event_outbox` table within the same database transaction as the domain entity, then asynchronously relayed by a background worker. This ensures at-least-once delivery without distributed transactions.

**Key architectural decisions:**
- **Port/Adapter**: `EventBusPort` interface in application layer, `NestjsEventEmitterAdapter` in infrastructure
- **Transactional Outbox**: Events saved atomically with domain entities using Prisma transactions
- **Relay Worker**: Cron-based batch processor with exponential backoff and dead-letter handling
- **Module Structure**: Shared `EventBusModule` + `OutboxModule` for clear separation

## Architecture Decisions

### Decision: Transactional Outbox vs. Dual Write

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Dual write (DB + message broker) | Risk of inconsistency if one write fails | ❌ Rejected |
| Transactional Outbox (DB only) | Single source of truth, requires relay worker | ✅ Chosen |
| CDC (Change Data Capture) | Complex infra, overkill for current scale | ❌ Rejected |

**Rationale**: Outbox pattern provides strong consistency with existing Prisma/PostgreSQL stack. Worker can be scaled independently.

### Decision: NestJS EventEmitter2 vs. External Broker (Kafka/RabbitMQ)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| External broker | Horizontal scaling, durability, replay | ❌ Deferred to Phase 5 |
| NestJS EventEmitter2 | In-process, zero infra, simple testing | ✅ Chosen for MVP |

**Rationale**: EventEmitter2 with outbox provides reliability within single process. External broker added later when multi-instance deployment needed.

### Decision: Event Payload Structure

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Full entity in payload | Large payloads, coupling | ❌ Rejected |
| Minimal payload (ids + key data) | Requires read-side lookup | ✅ Chosen |

**Rationale**: Payloads contain correlationId, userId, and domain-specific fields. Consumers can hydrate via repositories if needed.

## Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Use Case       │     │  Prisma          │     │  EventOutbox    │
│  (RecordState   │────▶│  Transaction     │────▶│  Table          │
│   Transition)   │     │  (entity +       │     │  (PENDING)      │
└─────────────────┘     │   outbox row)    │     └────────┬────────┘
                        └──────────────────┘              │
                                                         ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Event Handlers │◀────│  OutboxRelay     │◀────│  Cron Trigger   │
│  (subscribers)  │     │  Worker          │     │  (every 30s)    │
└─────────────────┘     │  (batch, retry,  │     └─────────────────┘
                        │   dead-letter)   │
                        └──────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/ports/out/event-bus.port.ts` | Create | EventBusPort interface (publish, publishAll) |
| `src/infrastructure/events/nestjs-event-emitter.adapter.ts` | Create | Adapter using @nestjs/event-emitter |
| `src/infrastructure/events/event-bus.module.ts` | Create | Shared EventBusModule wiring |
| `prisma/schema.prisma` | Modify | Add EventOutbox model with indexes |
| `src/infrastructure/persistence/outbox-prisma.repository.ts` | Create | OutboxRepositoryPort + Prisma impl |
| `src/infrastructure/events/outbox.module.ts` | Create | OutboxModule with worker registration |
| `src/infrastructure/workers/outbox-relay.worker.ts` | Create | Cron worker with batch, backoff, DLQ |
| `src/application/use-cases/record-state-transition.service.ts` | Modify | Inject EventBusPort, publish event |
| `src/application/use-cases/record-health-telemetry.service.ts` | Modify | Inject EventBusPort, publish event |
| `src/domain/events/health-telemetry-recorded.event.ts` | Create | New HealthTelemetryRecorded event |
| `src/domain/events/user-state-transitioned.event.ts` | Modify | Update payload to match spec |
| `src/app.module.ts` | Modify | Import EventBusModule, OutboxModule |
| `src/shared/ports/out/outbox-repository.port.ts` | Create | Port interface for outbox |
| `src/infrastructure/events/event-bus.module.ts` | Create | Shared module for EventBusPort |
| `test/integration/outbox-relay.worker.integration.spec.ts` | Create | Integration tests for relay worker |
| `src/infrastructure/events/__tests__/nestjs-event-emitter.adapter.spec.ts` | Create | Unit tests for adapter |
| `src/infrastructure/persistence/__tests__/outbox-prisma.repository.spec.ts` | Create | Unit tests for outbox repo |

## Interfaces / Contracts

### EventBusPort (Application Layer)

```typescript
// src/shared/ports/out/event-bus.port.ts
import { DomainEvent } from '../../domain/domain-event.interface';

export interface EventBusPort {
  publish<T>(event: DomainEvent<T>): Promise<void>;
  publishAll<T>(events: DomainEvent<T>[]): Promise<void>;
}
```

### Domain Events

```typescript
// src/domain/events/user-state-transitioned.event.ts (MODIFIED)
export interface UserStateTransitionedPayload {
  readonly userId: string;
  readonly currentState: string;
  readonly previousState: string | null;
  readonly transitionedAt: number;
  readonly correlationId: string; // Added per spec
}

// src/domain/events/health-telemetry-recorded.event.ts (NEW)
export interface HealthTelemetryRecordedPayload {
  readonly userId: string;
  readonly metricType: string;
  readonly value: number;
  readonly unit: string;
  readonly deviceTimestamp: number;
  readonly serverReceivedAt: number;
  readonly correlationId: string;
}

export class HealthTelemetryRecorded implements DomainEvent<HealthTelemetryRecordedPayload> {
  public readonly eventName = 'health_telemetry.recorded';
  public readonly version = 'v1';

  constructor(
    public readonly eventId: string,
    public readonly correlationId: string,
    public readonly occurredOn: number,
    public readonly payload: HealthTelemetryRecordedPayload,
  ) {}
}
```

### OutboxRepositoryPort

```typescript
// src/shared/ports/out/outbox-repository.port.ts
import { EventOutbox } from '../../domain/event-outbox.entity';

export interface OutboxRepositoryPort {
  saveInTransaction(event: DomainEvent<unknown>, tx: Prisma.TransactionClient): Promise<void>;
  findPendingBatch(limit: number): Promise<EventOutbox[]>;
  markPublished(ids: string[]): Promise<void>;
  markFailed(ids: string[], error: string): Promise<void>;
  moveToDeadLetter(ids: string[], error: string): Promise<void>;
}
```

### Prisma EventOutbox Model

```prisma
// prisma/schema.prisma (ADDITION)
model EventOutbox {
  id            String   @id @default(uuid())
  eventId       String   @unique
  eventName     String
  correlationId String
  payload       Json
  status        EventOutboxStatus @default(PENDING)
  retryCount    Int      @default(0)
  lastError     String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  publishedAt   DateTime?

  @@index([status, createdAt])
  @@index([correlationId])
  @@map("event_outbox")
}

enum EventOutboxStatus {
  PENDING
  PUBLISHED
  FAILED
  DEAD_LETTER
}
```

## Key Implementations

### NestjsEventEmitterAdapter

```typescript
// src/infrastructure/events/nestjs-event-emitter.adapter.ts
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventBusPort } from '../../../shared/ports/out/event-bus.port';
import { DomainEvent } from '../../../shared/domain/domain-event.interface';

@Injectable()
export class NestjsEventEmitterAdapter implements EventBusPort {
  constructor(private readonly emitter: EventEmitter2) {}

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    this.emitter.emit(event.eventName, event);
  }

  async publishAll<T>(events: DomainEvent<T>[]): Promise<void> {
    for (const event of events) {
      this.emitter.emit(event.eventName, event);
    }
  }
}
```

### OutboxRelayWorker

```typescript
// src/infrastructure/workers/outbox-relay.worker.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OutboxRepositoryPort } from '../../../shared/ports/out/outbox-repository.port';
import { EventBusPort } from '../../../shared/ports/out/event-bus.port';

@Injectable()
export class OutboxRelayWorker {
  private readonly logger = new Logger(OutboxRelayWorker.name);
  private readonly BATCH_SIZE = 100;
  private readonly MAX_RETRIES = 5;
  private readonly BASE_DELAY_MS = 1000;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('OutboxRepository')
    private readonly outboxRepo: OutboxRepositoryPort,
    @Inject('EventBusPort')
    private readonly eventBus: EventBusPort,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async processOutbox(): Promise<void> {
    const pending = await this.outboxRepo.findPendingBatch(this.BATCH_SIZE);
    if (pending.length === 0) return;

    const eventMap = new Map<string, DomainEvent<unknown>[]>();
    for (const record of pending) {
      const event = this.deserializeEvent(record);
      const key = record.eventName;
      if (!eventMap.has(key)) eventMap.set(key, []);
      eventMap.get(key)!.push(event);
    }

    for (const [eventName, events] of eventMap) {
      await this.publishWithRetry(eventName, events, pending);
    }
  }

  private async publishWithRetry(
    eventName: string,
    events: DomainEvent<unknown>[],
    allRecords: EventOutbox[],
  ): Promise<void> {
    const recordIds = events.map(e => e.eventId);
    let attempt = 0;

    while (attempt <= this.MAX_RETRIES) {
      try {
        await this.eventBus.publishAll(events);
        await this.outboxRepo.markPublished(recordIds);
        this.logger.log(`Published ${events.length} events: ${eventName}`);
        return;
      } catch (error) {
        attempt++;
        if (attempt > this.MAX_RETRIES) {
          await this.outboxRepo.moveToDeadLetter(recordIds, error.message);
          this.logger.error(`Dead-lettered ${events.length} events: ${eventName}`, error.stack);
          return;
        }
        const delay = this.BASE_DELAY_MS * Math.pow(2, attempt - 1);
        this.logger.warn(`Retry ${attempt}/${this.MAX_RETRIES} for ${eventName} after ${delay}ms`);
        await this.sleep(delay);
      }
    }
  }

  private deserializeEvent(record: EventOutbox): DomainEvent<unknown> {
    return {
      eventId: record.eventId,
      eventName: record.eventName,
      correlationId: record.correlationId,
      version: 'v1',
      occurredOn: record.createdAt.getTime(),
      payload: record.payload,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Use Case Integration

```typescript
// src/application/use-cases/record-state-transition.service.ts (MODIFIED)
@Injectable()
export class RecordStateTransitionService implements RecordStateTransitionUseCase {
  constructor(
    @Inject('UserStateRepository')
    private readonly userStateRepository: UserStateRepository,
    @Inject('EventBusPort')
    private readonly eventBus: EventBusPort,
  ) {}

  async execute(command: RecordStateTransitionCommand): Promise<...> {
    const { entity, event } = UserState.transition(...);

    await this.prisma.$transaction(async (tx) => {
      await this.userStateRepository.save(entity);
      await this.outboxRepository.saveInTransaction(event, tx);
    });

    return { entityId: entity.id, event };
  }
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `NestjsEventEmitterAdapter` emits correct events | Mock EventEmitter2, verify emit calls |
| Unit | `OutboxPrismaRepository` CRUD operations | Mock PrismaService, verify queries |
| Unit | `OutboxRelayWorker` batch processing logic | Mock repo + eventBus, test retry/backoff/DLQ |
| Integration | Transactional save (entity + outbox) | Testcontainers PostgreSQL, verify atomicity |
| Integration | Full relay cycle: PENDING → PUBLISHED | Spin up app, publish event, verify worker picks up |
| E2E | HTTP → Use Case → Outbox → Worker → Handler | Supertest + real modules, end-to-end flow |

## Migration / Rollout

1. **Migration**: Add `EventOutbox` model to Prisma schema, run `prisma migrate dev`
2. **Feature Flag**: `EVENT_BUS_ENABLED` (default: `true`) — disable to skip publishing
3. **Phased Rollout**:
   - Deploy schema + modules (worker inactive)
   - Enable worker cron via env `OUTBOX_WORKER_ENABLED=true`
   - Monitor dead-letter queue via logs

## Open Questions

- [ ] Should `publishAll` use single `emit` with array or sequential emits? (Current: sequential for ordering)
- [ ] Dead-letter retention policy? (Propose: 30 days, then purge via cron)
- [ ] Metrics export (Prometheus) for outbox lag? (Deferred to observability phase)
- [ ] Idempotency keys for consumers? (Required for exactly-once semantics — Phase 5)

---

## Summary

- **Approach**: Transactional outbox with NestJS EventEmitter2 adapter and cron relay worker
- **Key Decisions**: 3 documented (outbox pattern, EventEmitter2, minimal payload)
- **Files Affected**: 12 new, 5 modified, 0 deleted
- **Testing Strategy**: Unit (3), Integration (2), E2E (1)
- **Next Step**: Ready for tasks (sdd-tasks)