import { ICampaignRepository } from '../../../domain/repositories/campaign.repository';
import { IAccountRepository } from '../../../domain/repositories/account.repository';
import { DIContainer } from '../../../infrastructure/di/container';
import { ExternalApiService } from '../../services/external-api.service';
import { Campaign } from '../../../domain/entities/campaign.entity';

export class SyncCampaignsUseCase {
  private campaignRepository: ICampaignRepository;
  private accountRepository: IAccountRepository;
  private externalApiService: ExternalApiService;
  private readonly CONCURRENCY_LIMIT = 10; // Limit concurrent upserts to avoid overwhelming the database

  constructor(
    campaignRepository?: ICampaignRepository,
    accountRepository?: IAccountRepository,
    externalApiService?: ExternalApiService
  ) {
    this.campaignRepository = campaignRepository || DIContainer.getCampaignRepository();
    this.accountRepository = accountRepository || DIContainer.getAccountRepository();
    this.externalApiService = externalApiService || DIContainer.getExternalApiService();
  }

  async execute(accountId: string): Promise<Campaign[]> {
    // Validate account exists before syncing campaigns
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new Error(`Account with id ${accountId} not found`);
    }

    let cursor: string | undefined;
    const allCampaigns: Campaign[] = [];

    // Fetch all campaigns with pagination
    do {
      const response = await this.externalApiService.fetchCampaigns(accountId, cursor);
      const { items, nextCursor } = response;

      // Parallelize upserts within each page with concurrency limit
      const upsertPromises = items.map(campaignData =>
        this.campaignRepository.upsert({
          id: campaignData.id,
          name: campaignData.name,
          status: campaignData.status,
          spend: campaignData.spend,
          budget: campaignData.budget,
          accountId,
        })
      );

      // Process in batches to limit concurrency
      for (let i = 0; i < upsertPromises.length; i += this.CONCURRENCY_LIMIT) {
        const batch = upsertPromises.slice(i, i + this.CONCURRENCY_LIMIT);
        const batchResults = await Promise.all(batch);
        allCampaigns.push(...batchResults);
      }

      cursor = nextCursor;
    } while (cursor);

    return allCampaigns;
  }
}

