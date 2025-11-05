import { AppError } from './base.error';

export class ExternalApiError extends AppError {
  readonly statusCode = 502; // Bad Gateway
  readonly code = 'EXTERNAL_API_ERROR';

  constructor(
    message: string,
    public readonly originalError?: unknown,
    public readonly retryable: boolean = false
  ) {
    super(message, { originalError, retryable });
  }
}

