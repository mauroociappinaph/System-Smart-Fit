import { randomUUID } from 'crypto';
import { InsightGenerated } from '../events/insight-generated.event';

export enum ValidationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISCARDED = 'discarded',
}

export const NOT_PENDING_ERROR = 'AgentInsight: insight is not in PENDING status';

export class AgentInsight {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _correlationId: string,
    private readonly _category: string,
    private readonly _content: string,
    private readonly _score: number,
    private _validationStatus: ValidationStatus,
    private readonly _createdAt: number,
    private _updatedAt: number,
  ) {}

  public get id(): string {
    return this._id;
  }
  public get userId(): string {
    return this._userId;
  }
  public get correlationId(): string {
    return this._correlationId;
  }
  public get category(): string {
    return this._category;
  }
  public get content(): string {
    return this._content;
  }
  public get score(): number {
    return this._score;
  }
  public get validationStatus(): ValidationStatus {
    return this._validationStatus;
  }
  public get createdAt(): number {
    return this._createdAt;
  }
  public get updatedAt(): number {
    return this._updatedAt;
  }

  /**
   * Factory method — creates a new AgentInsight with PENDING status
   * and its corresponding domain event.
   */
  public static create(
    userId: string,
    correlationId: string,
    category: string,
    content: string,
    score: number,
    overrides?: {
      insightId?: string;
      eventId?: string;
    },
  ): { entity: AgentInsight; event: InsightGenerated } {
    const insightId = overrides?.insightId ?? randomUUID();
    const eventId = overrides?.eventId ?? randomUUID();
    const now = Date.now();

    const entity = new AgentInsight(
      insightId,
      userId,
      correlationId,
      category,
      content,
      score,
      ValidationStatus.PENDING,
      now,
      now,
    );

    const event = new InsightGenerated(eventId, correlationId, now, {
      userId,
      insightId,
      category,
      content,
      score,
      correlationId,
    });

    return { entity, event };
  }

  /**
   * Reconstitute an AgentInsight from persisted data (bypasses factory logic).
   * Intended for repository adapters only.
   */
  public static reconstitute(
    id: string,
    userId: string,
    correlationId: string,
    category: string,
    content: string,
    score: number,
    validationStatus: ValidationStatus,
    createdAt: number,
    updatedAt: number,
  ): AgentInsight {
    return new AgentInsight(
      id,
      userId,
      correlationId,
      category,
      content,
      score,
      validationStatus,
      createdAt,
      updatedAt,
    );
  }

  /**
   * Approve this insight — sets validationStatus to APPROVED.
   */
  public approve(): void {
    if (this._validationStatus !== ValidationStatus.PENDING) {
      throw new Error(NOT_PENDING_ERROR);
    }
    this._validationStatus = ValidationStatus.APPROVED;
    this._updatedAt = Date.now();
  }

  /**
   * Reject this insight — sets validationStatus to REJECTED.
   */
  public reject(): void {
    if (this._validationStatus !== ValidationStatus.PENDING) {
      throw new Error(NOT_PENDING_ERROR);
    }
    this._validationStatus = ValidationStatus.REJECTED;
    this._updatedAt = Date.now();
  }

  /**
   * Discard this insight — sets validationStatus to DISCARDED.
   */
  public discard(): void {
    if (this._validationStatus !== ValidationStatus.PENDING) {
      throw new Error(NOT_PENDING_ERROR);
    }
    this._validationStatus = ValidationStatus.DISCARDED;
    this._updatedAt = Date.now();
  }
}
