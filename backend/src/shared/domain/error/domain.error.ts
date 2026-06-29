/**
 * Base domain error — all domain-specific errors extend this.
 * Keeps domain logic framework-agnostic: services throw DomainErrors,
 * and a NestJS ExceptionFilter translates them to HTTP responses.
 */
export abstract class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
