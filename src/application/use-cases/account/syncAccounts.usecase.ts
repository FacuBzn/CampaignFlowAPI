import { IAccountRepository } from '../../../domain/repositories/account.repository';
import { DIContainer } from '../../../infrastructure/di/container';
import { ExternalApiService } from '../../services/external-api.service';
import { Account } from '../../../domain/entities/account.entity';

export class SyncAccountsUseCase {
  private accountRepository: IAccountRepository;
  private externalApiService: ExternalApiService;

  constructor(
    accountRepository?: IAccountRepository,
    externalApiService?: ExternalApiService
  ) {
    this.accountRepository = accountRepository || DIContainer.getAccountRepository();
    this.externalApiService = externalApiService || DIContainer.getExternalApiService();
  }

  async execute(): Promise<Account[]> {
    // Fetch accounts from external API
    const externalAccounts = await this.externalApiService.fetchAccounts();

    // Upsert all accounts in parallel
    const syncPromises = externalAccounts.map(account =>
      this.accountRepository.upsert({
        id: account.id,
        name: account.name,
      })
    );

    return await Promise.all(syncPromises);
  }
}

