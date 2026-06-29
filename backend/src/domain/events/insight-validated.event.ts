import { DomainEvent } from '../../shared/domain/domain-event.interface';
import { ValidationStatus } from '../entities/agent-insight.entity';

export interface InsightValidatedPayload {
  readonly insightId: string;
  readonly userId: string;
  readonly validationStatus: ValidationStatus;
  readonly action: string;
}

export class InsightValidated implements DomainEvent<InsightValidatedPayload> {
  public readonly eventName = 'agent_insight.validated';
  public readonly version = 'v1';

  constructor(
    public readonly eventId: string,
    public readonly correlationId: string,
    public readonly occurredOn: number,
    public readonly payload: InsightValidatedPayload,
  ) {}
}
