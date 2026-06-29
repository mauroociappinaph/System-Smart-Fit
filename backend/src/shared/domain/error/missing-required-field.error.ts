import { DomainError } from './domain.error';

export class MissingRequiredFieldError extends DomainError {
  constructor(entityName: string, fieldName: string) {
    super(
      `${entityName}: Missing required field "${fieldName}"`,
      'MISSING_REQUIRED_FIELD',
    );
  }
}
