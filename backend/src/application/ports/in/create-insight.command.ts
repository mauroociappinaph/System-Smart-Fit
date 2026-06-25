export interface CreateInsightCommand {
  readonly userId: string;
  readonly correlationId: string;
  readonly category: string;
  readonly content: string;
  readonly score: number;
  readonly insightId?: string;
  readonly eventId?: string;
}
