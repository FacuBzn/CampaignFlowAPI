import { ICampaignRepository } from '../../../domain/repositories/campaign.repository';
import { IAccountRepository } from '../../../domain/repositories/account.repository';
import { DIContainer } from '../../../infrastructure/di/container';
import { ExternalApiService } from '../../services/external-api.service';
import { Campaign } from '../../../domain/entities/campaign.entity';
import { AccountNotFoundError } from '../../../domain/errors/account-not-found.error';
import { ValidationError } from '../../../domain/errors/validation.error';
import { LockService } from '../../../infrastructure/services/lock.service';

export class SyncCampaignsUseCase {
  private campaignRepository: ICampaignRepository;
  private accountRepository: IAccountRepository;
  private externalApiService: ExternalApiService;
  private lockService: LockService;
  private readonly CONCURRENCY_LIMIT = 10; // Limit concurrent upserts to avoid overwhelming the database

  constructor(
    campaignRepository?: ICampaignRepository,
    accountRepository?: IAccountRepository,
    externalApiService?: ExternalApiService,
    lockService?: LockService
  ) {
    this.campaignRepository = campaignRepository || DIContainer.getCampaignRepository();
    this.accountRepository = accountRepository || DIContainer.getAccountRepository();
    this.externalApiService = externalApiService || DIContainer.getExternalApiService();
    this.lockService = lockService || new LockService();
  }

  private validateCampaignData(campaignData: { spend: number; budget: number; status: string }): void {
    const MAX_AMOUNT = 999999999.99;
    const errors: Record<string, string[]> = {};

    if (campaignData.spend < 0) {
      errors.spend = ['Spend cannot be negative'];
    }
    if (campaignData.spend > MAX_AMOUNT) {
      errors.spend = [`Spend cannot exceed ${MAX_AMOUNT}`];
    }
    if (campaignData.budget < 0) {
      errors.budget = ['Budget cannot be negative'];
    }
    if (campaignData.budget > MAX_AMOUNT) {
      errors.budget = [`Budget cannot exceed ${MAX_AMOUNT}`];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Invalid campaign data', errors);
    }
  }

  async execute(accountId: string): Promise<Campaign[]> {
    // Adquirir lock para prevenir sincronizaciones concurrentes
    const releaseLock = await this.lockService.acquireLock(accountId, 300000); // 5 minutos

    try {
      // Validate account exists before syncing campaigns
      const account = await this.accountRepository.findById(accountId);
      if (!account) {
        throw new AccountNotFoundError(accountId);
      }

      let cursor: string | undefined;
      const allCampaigns: Campaign[] = [];

    // Fetch all campaigns with pagination
    do {
      const response = await this.externalApiService.fetchCampaigns(accountId, cursor);
      const { items, nextCursor } = response;

      // Validar y preparar datos
      const campaignsToUpsert = items.map(campaignData => {
        this.validateCampaignData(campaignData);
        
        return {
          id: campaignData.id,
          name: campaignData.name,
          status: campaignData.status,
          spend: campaignData.spend,
          budget: campaignData.budget,
          accountId,
        };
      });

      // Batch upsert en lugar de individual
      const batchResults = await this.campaignRepository.upsertMany(campaignsToUpsert);
      allCampaigns.push(...batchResults);

      cursor = nextCursor;
    } while (cursor);

      return allCampaigns;
    } finally {
      // Liberar lock
      releaseLock();
    }
  }
}

