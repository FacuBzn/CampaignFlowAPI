import { Campaign } from '../entities/campaign.entity';

export interface CampaignMetrics {
  accountId: string;
  totalCampaigns: number;
  totalSpend: number;
  totalBudget: number;
}

export interface ICampaignRepository {
  create(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign>;
  findAll(): Promise<Campaign[]>;
  findById(id: string): Promise<Campaign | null>;
  findByAccountId(accountId: string): Promise<Campaign[]>;
  update(id: string, campaign: Partial<Campaign>): Promise<Campaign>;
  delete(id: string): Promise<void>;
  upsert(campaign: {
    id?: string;
    name: string;
    status: string;
    spend: number;
    budget: number;
    accountId: string;
  }): Promise<Campaign>;
  getMetricsForAccount(accountId: string): Promise<CampaignMetrics>;
}

