import { AppError } from './base.error';

export class AccountNotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = 'ACCOUNT_NOT_FOUND';

  constructor(accountId: string) {
    super(`Account with id ${accountId} not found`, { accountId });
  }
}

