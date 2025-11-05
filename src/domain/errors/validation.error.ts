import { AppError } from './base.error';

export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = 'VALIDATION_ERROR';

  constructor(message: string, public readonly fields?: Record<string, string[]>) {
    super(message, { fields });
  }
}

