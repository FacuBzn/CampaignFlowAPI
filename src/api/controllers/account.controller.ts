import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateAccountUseCase } from '../../application/use-cases/account/createAccount.usecase';
import { GetAccountsUseCase } from '../../application/use-cases/account/getAccounts.usecase';
import { SyncAccountsUseCase } from '../../application/use-cases/account/syncAccounts.usecase';
import { createAccountSchema, paginationQuerySchema, sortQuerySchema } from '../schemas/account.schema';
import { DIContainer } from '../../infrastructure/di/container';
import { AppError } from '../../domain/errors/base.error';

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

  async getAll(
    request: FastifyRequest<{ 
      Querystring: { 
        limit?: string; 
        offset?: string;
        orderBy?: string;
        orderDirection?: string;
      } 
    }>, 
    reply: FastifyReply
  ) {
    try {
      const query = paginationQuerySchema.merge(sortQuerySchema).parse({
        limit: request.query.limit,
        offset: request.query.offset,
        orderBy: request.query.orderBy,
        orderDirection: request.query.orderDirection,
      });

      const result = await this.getAccountsUseCase.execute({
        limit: query.limit,
        offset: query.offset,
        sort: {
          orderBy: query.orderBy,
          orderDirection: query.orderDirection,
        },
      });

      return reply.send(result);
    } catch (error) {
      return this.handleError(error, request, reply, 'Failed to get accounts');
    }
  }

  async create(request: FastifyRequest<{ Body: { name: string } }>, reply: FastifyReply) {
    try {
      // Validate input with Zod schema
      const validatedInput = createAccountSchema.parse(request.body);
      const account = await this.createAccountUseCase.execute(validatedInput);
      return reply.code(201).send({ data: account });
    } catch (error) {
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
      return this.handleError(error, request, reply, 'Failed to create account');
    }
  }

  async sync(request: FastifyRequest, reply: FastifyReply) {
    try {
      const accounts = await this.syncAccountsUseCase.execute();
      return reply.send({ data: accounts });
    } catch (error) {
      return this.handleError(error, request, reply, 'Failed to sync accounts');
    }
  }

  private handleError(
    error: unknown,
    request: FastifyRequest,
    reply: FastifyReply,
    defaultMessage: string
  ) {
    request.log.error({ err: error }, 'Controller error');

    // Si es AppError, usar su statusCode
    if (error instanceof AppError) {
      const errorResponse: {
        message: string;
        code: string;
        statusCode: number;
        details?: unknown;
      } = {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      };
      
      if (error.details) {
        errorResponse.details = error.details;
      }
      
      return reply.status(error.statusCode).send({
        error: errorResponse,
      });
    }

    // Error desconocido - 500
    return reply.status(500).send({
      error: {
        message: defaultMessage,
        statusCode: 500,
      },
    });
  }
}

