import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateAccountUseCase } from '../../application/use-cases/account/createAccount.usecase';
import { GetAccountsUseCase } from '../../application/use-cases/account/getAccounts.usecase';
import { SyncAccountsUseCase } from '../../application/use-cases/account/syncAccounts.usecase';

export class AccountController {
  private getAccounts = new GetAccountsUseCase();
  private createAccount = new CreateAccountUseCase();
  private syncAccounts = new SyncAccountsUseCase();

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const accounts = await this.getAccounts.execute();
      return reply.send({ data: accounts });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to get accounts' });
    }
  }

  async create(request: FastifyRequest<{ Body: { name: string } }>, reply: FastifyReply) {
    try {
      const account = await this.createAccount.execute(request.body);
      return reply.code(201).send({ data: account });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to create account' });
    }
  }

  async sync(request: FastifyRequest, reply: FastifyReply) {
    try {
      const accounts = await this.syncAccounts.execute();
      return reply.send({ data: accounts });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to sync accounts' });
    }
  }
}

