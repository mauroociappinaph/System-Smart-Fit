import { Module, Global, Provider } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NestjsEventEmitterAdapter, NESTJS_EVENT_EMITTER_ADAPTER_PROVIDER } from '@/infrastructure/adapters/event-bus/nestjs-event-emitter.adapter';
import { PrismaOutboxRepository } from '@/infrastructure/persistence/event-outbox-prisma.repository';
import { OUTBOX_REPOSITORY_PORT } from '@/application/ports/out/event-outbox.repository';

const outboxRepositoryProvider: Provider = {
  provide: OUTBOX_REPOSITORY_PORT,
  useClass: PrismaOutboxRepository,
};

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
  ],
  providers: [NESTJS_EVENT_EMITTER_ADAPTER_PROVIDER, outboxRepositoryProvider],
  exports: [NESTJS_EVENT_EMITTER_ADAPTER_PROVIDER, OUTBOX_REPOSITORY_PORT],
})
export class EventBusModule {}