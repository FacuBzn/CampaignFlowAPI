import { IAccountRepository } from '../../domain/repositories/account.repository';
import { ICampaignRepository } from '../../domain/repositories/campaign.repository';
import { AccountPrismaRepository } from '../repositories/account.prisma.repository';
import { CampaignPrismaRepository } from '../repositories/campaign.prisma.repository';
import { ExternalApiService } from '../../application/services/external-api.service';
import { CreateAccountUseCase } from '../../application/use-cases/account/createAccount.usecase';
import { GetAccountsUseCase } from '../../application/use-cases/account/getAccounts.usecase';
import { SyncAccountsUseCase } from '../../application/use-cases/account/syncAccounts.usecase';
import { SyncCampaignsUseCase } from '../../application/use-cases/campaign/syncCampaigns.usecase';
import { GetCampaignMetricsUseCase } from '../../application/use-cases/campaign/getCampaignMetrics.usecase';
import { SyncAllCampaignsUseCase } from '../../application/use-cases/campaign/syncAllCampaigns.usecase';

export class DIContainer {
  private static accountRepository: IAccountRepository | null = null;
  private static campaignRepository: ICampaignRepository | null = null;
  private static externalApiService: ExternalApiService | null = null;

  static getAccountRepository(): IAccountRepository {
    if (!this.accountRepository) {
      this.accountRepository = new AccountPrismaRepository();
    }
    return this.accountRepository;
  }

  static getCampaignRepository(): ICampaignRepository {
    if (!this.campaignRepository) {
      this.campaignRepository = new CampaignPrismaRepository();
    }
    return this.campaignRepository;
  }

  static getExternalApiService(): ExternalApiService {
    if (!this.externalApiService) {
      this.externalApiService = new ExternalApiService();
    }
    return this.externalApiService;
  }

  // Use case getters
  static getCreateAccountUseCase(): CreateAccountUseCase {
    return new CreateAccountUseCase();
  }

  static getGetAccountsUseCase(): GetAccountsUseCase {
    return new GetAccountsUseCase();
  }

  static getSyncAccountsUseCase(): SyncAccountsUseCase {
    return new SyncAccountsUseCase();
  }

  static getSyncCampaignsUseCase(): SyncCampaignsUseCase {
    return new SyncCampaignsUseCase();
  }

  static getGetCampaignMetricsUseCase(): GetCampaignMetricsUseCase {
    return new GetCampaignMetricsUseCase();
  }

  static getSyncAllCampaignsUseCase(): SyncAllCampaignsUseCase {
    return new SyncAllCampaignsUseCase();
  }

  // Reset methods for testing
  static reset(): void {
    this.accountRepository = null;
    this.campaignRepository = null;
    this.externalApiService = null;
  }
}

