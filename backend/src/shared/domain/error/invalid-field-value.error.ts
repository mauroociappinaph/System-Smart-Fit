import { DomainError } from './domain.error';

export class InvalidFieldValueError extends DomainError {
  constructor(entityName: string, fieldName: string, reason: string) {
    super(
      `${entityName}: Invalid value for field "${fieldName}" — ${reason}`,
      'INVALID_FIELD_VALUE',
    );
  }
}
