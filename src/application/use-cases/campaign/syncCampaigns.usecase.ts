import { ICampaignRepository } from '../../domain/repositories/campaign.repository';
import { CampaignPrismaRepository } from '../../../infrastructure/repositories/campaign.prisma.repository';
import { ExternalApiService } from '../../services/external-api.service';
import { Campaign } from '../../domain/entities/campaign.entity';

export class SyncCampaignsUseCase {
  private campaignRepository: ICampaignRepository;
  private externalApiService: ExternalApiService;

  constructor(
    campaignRepository?: ICampaignRepository,
    externalApiService?: ExternalApiService
  ) {
    this.campaignRepository = campaignRepository || new CampaignPrismaRepository();
    this.externalApiService = externalApiService || new ExternalApiService();
  }

  async execute(accountId: string): Promise<Campaign[]> {
    let cursor: string | undefined;
    const allCampaigns: Campaign[] = [];

    // Fetch all campaigns with pagination
    do {
      const response = await this.externalApiService.fetchCampaigns(accountId, cursor);
      const { items, nextCursor } = response;

      // Upsert each campaign
      for (const campaignData of items) {
        const campaign = await this.campaignRepository.upsert({
          id: campaignData.id,
          name: campaignData.name,
          status: campaignData.status,
          spend: campaignData.spend,
          budget: campaignData.budget,
          accountId,
        });
        allCampaigns.push(campaign);
      }

      cursor = nextCursor;
    } while (cursor);

    return allCampaigns;
  }
}

