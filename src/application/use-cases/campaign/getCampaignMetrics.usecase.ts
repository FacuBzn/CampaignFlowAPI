import { ICampaignRepository } from '../../../domain/repositories/campaign.repository';
import { CampaignPrismaRepository } from '../../../infrastructure/repositories/campaign.prisma.repository';

export interface CampaignMetrics {
  accountId: string;
  totalCampaigns: number;
  totalSpend: number;
  totalBudget: number;
}

export class GetCampaignMetricsUseCase {
  private campaignRepository: ICampaignRepository;

  constructor(campaignRepository?: ICampaignRepository) {
    this.campaignRepository = campaignRepository || new CampaignPrismaRepository();
  }

  async execute(accountId: string): Promise<CampaignMetrics> {
    const campaigns = await this.campaignRepository.findByAccountId(accountId);

    const totalCampaigns = campaigns.length;
    const totalSpend = campaigns.reduce((sum: number, camp: any) => sum + camp.spend, 0);
    const totalBudget = campaigns.reduce((sum: number, camp: any) => sum + camp.budget, 0);

    return {
      accountId,
      totalCampaigns,
      totalSpend,
      totalBudget,
    };
  }
}

