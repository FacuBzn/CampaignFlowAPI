import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateAccountUseCase } from '../../application/use-cases/account/createAccount.usecase';
import { GetAccountsUseCase } from '../../application/use-cases/account/getAccounts.usecase';
import { SyncAccountsUseCase } from '../../application/use-cases/account/syncAccounts.usecase';
import { createAccountSchema } from '../schemas/account.schema';
import { DIContainer } from '../../infrastructure/di/container';

export class AccountController {
  private getAccountsUseCase: GetAccountsUseCase;
  private createAccountUseCase: CreateAccountUseCase;
  private syncAccountsUseCase: SyncAccountsUseCase;

  constructor(
    getAccountsUseCase?: GetAccountsUseCase,
    createAccountUseCase?: CreateAccountUseCase,
    syncAccountsUseCase?: SyncAccountsUseCase
  ) {
    this.getAccountsUseCase = getAccountsUseCase || DIContainer.getGetAccountsUseCase();
    this.createAccountUseCase = createAccountUseCase || DIContainer.getCreateAccountUseCase();
    this.syncAccountsUseCase = syncAccountsUseCase || DIContainer.getSyncAccountsUseCase();
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const accounts = await this.getAccountsUseCase.execute();
      return reply.send({ data: accounts });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to get accounts' });
    }
  }

  async create(request: FastifyRequest<{ Body: { name: string } }>, reply: FastifyReply) {
    try {
      // Validate input with Zod schema
      const validatedInput = createAccountSchema.parse(request.body);
      const account = await this.createAccountUseCase.execute(validatedInput);
      return reply.code(201).send({ data: account });
    } catch (error) {
      request.log.error(error);
      // Handle Zod validation errors
      if (error && typeof error === 'object' && 'issues' in error) {
        return reply.status(400).send({
          error: {
            message: 'Validation error',
            details: error.issues,
            statusCode: 400,
          },
        });
      }
      return reply.status(500).send({ error: 'Failed to create account' });
    }
  }

  async sync(request: FastifyRequest, reply: FastifyReply) {
    try {
      const accounts = await this.syncAccountsUseCase.execute();
      return reply.send({ data: accounts });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to sync accounts' });
    }
  }
}

