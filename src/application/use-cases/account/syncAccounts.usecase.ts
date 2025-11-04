import { IAccountRepository } from '../../../domain/repositories/account.repository';
import { AccountPrismaRepository } from '../../../infrastructure/repositories/account.prisma.repository';
import { ExternalApiService } from '../../services/external-api.service';
import { Account } from '../../../domain/entities/account.entity';

export class SyncAccountsUseCase {
  private accountRepository: IAccountRepository;
  private externalApiService: ExternalApiService;

  constructor(
    accountRepository?: IAccountRepository,
    externalApiService?: ExternalApiService
  ) {
    this.accountRepository = accountRepository || new AccountPrismaRepository();
    this.externalApiService = externalApiService || new ExternalApiService();
  }

  async execute(): Promise<Account[]> {
    // Fetch accounts from external API
    const externalAccounts = await this.externalApiService.fetchAccounts();

    // Upsert each account
    const syncedAccounts: Account[] = [];
    for (const externalAccount of externalAccounts) {
      const account = await this.accountRepository.upsert({
        id: externalAccount.id,
        name: externalAccount.name,
      });
      syncedAccounts.push(account);
    }

    return syncedAccounts;
  }
}

