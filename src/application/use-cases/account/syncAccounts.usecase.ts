import { DIContainer } from '../../../infrastructure/di/container';
import { ExternalApiService } from '../../services/external-api.service';
import { Account } from '../../../domain/entities/account.entity';
import { prisma } from '../../../infrastructure/database/prisma/prismaClient';

export class SyncAccountsUseCase {
  private externalApiService: ExternalApiService;

  constructor(externalApiService?: ExternalApiService) {
    this.externalApiService = externalApiService || DIContainer.getExternalApiService();
  }

  async execute(): Promise<Account[]> {
    // Fetch accounts from external API
    const externalAccounts = await this.externalApiService.fetchAccounts();

    // Usar transacción Prisma directamente para asegurar atomicidad
    const results = await prisma.$transaction(
      async (tx) => {
        return Promise.all(
          externalAccounts.map(account =>
            tx.account.upsert({
              where: { id: account.id },
              update: { name: account.name },
              create: {
                id: account.id,
                name: account.name,
              },
            })
          )
        );
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );

    return results.map(acc => 
      new Account(acc.id, acc.name, acc.createdAt, acc.updatedAt)
    );
  }
}

