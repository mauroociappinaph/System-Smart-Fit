import { DomainEvent } from '../../shared/domain/domain-event.interface';

export interface InsightGeneratedPayload {
  readonly userId: string;
  readonly insightId: string;
  readonly category: string;
  readonly content: string;
  readonly score: number;
  readonly correlationId: string;
}

export class InsightGenerated implements DomainEvent<InsightGeneratedPayload> {
  public readonly eventName = 'agent_insight.generated';
  public readonly version = 'v1';

  constructor(
    public readonly eventId: string,
    public readonly correlationId: string,
    public readonly occurredOn: number,
    public readonly payload: InsightGeneratedPayload,
  ) {}
}
