import { ICampaignRepository, CampaignMetrics } from '../../../domain/repositories/campaign.repository';
import { DIContainer } from '../../../infrastructure/di/container';

export class GetCampaignMetricsUseCase {
  private campaignRepository: ICampaignRepository;

  constructor(campaignRepository?: ICampaignRepository) {
    this.campaignRepository = campaignRepository || DIContainer.getCampaignRepository();
  }

  async execute(accountId: string): Promise<CampaignMetrics> {
    return await this.campaignRepository.getMetricsForAccount(accountId);
  }
}

