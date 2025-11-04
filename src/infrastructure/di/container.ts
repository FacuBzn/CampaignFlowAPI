import { IAccountRepository } from '../../domain/repositories/account.repository';
import { ICampaignRepository } from '../../domain/repositories/campaign.repository';
import { AccountPrismaRepository } from '../repositories/account.prisma.repository';
import { CampaignPrismaRepository } from '../repositories/campaign.prisma.repository';
import { ExternalApiService } from '../../application/services/external-api.service';

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

  // Reset methods for testing
  static reset(): void {
    this.accountRepository = null;
    this.campaignRepository = null;
    this.externalApiService = null;
  }
}

