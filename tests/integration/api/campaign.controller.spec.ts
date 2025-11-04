import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import { campaignRoutes } from '../../../../src/api/routes/campaign.routes';
import { SyncCampaignsUseCase } from '../../../../src/application/use-cases/campaign/syncCampaigns.usecase';
import { GetCampaignMetricsUseCase } from '../../../../src/application/use-cases/campaign/getCampaignMetrics.usecase';
import { SyncAllCampaignsUseCase } from '../../../../src/application/use-cases/campaign/syncAllCampaigns.usecase';
import { Campaign } from '../../../../src/domain/entities/campaign.entity';

describe('CampaignController Integration', () => {
  let app: any;

  beforeEach(async () => {
    app = Fastify({ logger: false });
    await app.register(campaignRoutes);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should sync campaigns for a specific account', async () => {
    const accountId = 'account-123';
    const createdDate = new Date();
    const updatedDate = new Date();
    const mockCampaigns = [
      new Campaign('camp-1', 'Campaign 1', 'ACTIVE', 100, 1000, accountId, createdDate, updatedDate),
      new Campaign('camp-2', 'Campaign 2', 'PAUSED', 200, 2000, accountId, createdDate, updatedDate),
    ];

    vi.spyOn(SyncCampaignsUseCase.prototype, 'execute').mockResolvedValue(mockCampaigns);

    const response = await app.inject({
      method: 'POST',
      url: `/accounts/${accountId}/campaigns/sync`,
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.data.synced).toBe(2);
    expect(data.data.accountId).toBe(accountId);
  });

  it('should get campaign metrics for a specific account', async () => {
    const accountId = 'account-123';
    const mockMetrics = {
      accountId: 'account-123',
      totalCampaigns: 3,
      totalSpend: 450,
      totalBudget: 4500,
    };

    vi.spyOn(GetCampaignMetricsUseCase.prototype, 'execute').mockResolvedValue(mockMetrics);

    const response = await app.inject({
      method: 'GET',
      url: `/accounts/${accountId}/campaigns/metrics`,
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.data.accountId).toBe(accountId);
    expect(data.data.totalCampaigns).toBe(3);
    expect(data.data.totalSpend).toBe(450);
    expect(data.data.totalBudget).toBe(4500);
  });

  it('should sync all campaigns for all accounts concurrently', async () => {
    const mockResult = {
      total: 3,
      succeeded: 2,
      failed: 1,
      results: [
        { accountId: 'acct1', status: 'success' },
        { accountId: 'acct2', status: 'success' },
        { accountId: 'acct3', status: 'failed', error: 'Sync failed' },
      ],
    };

    vi.spyOn(SyncAllCampaignsUseCase.prototype, 'execute').mockResolvedValue(mockResult);

    const response = await app.inject({
      method: 'POST',
      url: '/sync/all',
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.data.total).toBe(3);
    expect(data.data.succeeded).toBe(2);
    expect(data.data.failed).toBe(1);
    expect(data.data.results).toHaveLength(3);
  });

  it('should handle errors when syncing campaigns', async () => {
    const accountId = 'account-123';

    vi.spyOn(SyncCampaignsUseCase.prototype, 'execute').mockRejectedValue(
      new Error('Failed to sync campaigns')
    );

    const response = await app.inject({
      method: 'POST',
      url: `/accounts/${accountId}/campaigns/sync`,
    });

    expect(response.statusCode).toBe(500);
    const data = JSON.parse(response.body);
    expect(data.error).toBe('Failed to sync campaigns');
  });

  it('should handle errors when getting metrics', async () => {
    const accountId = 'account-123';

    vi.spyOn(GetCampaignMetricsUseCase.prototype, 'execute').mockRejectedValue(
      new Error('Failed to get metrics')
    );

    const response = await app.inject({
      method: 'GET',
      url: `/accounts/${accountId}/campaigns/metrics`,
    });

    expect(response.statusCode).toBe(500);
    const data = JSON.parse(response.body);
    expect(data.error).toBe('Failed to get metrics');
  });

  it('should handle empty campaigns list', async () => {
    const accountId = 'account-123';

    vi.spyOn(SyncCampaignsUseCase.prototype, 'execute').mockResolvedValue([]);

    const response = await app.inject({
      method: 'POST',
      url: `/accounts/${accountId}/campaigns/sync`,
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.data.synced).toBe(0);
  });
});

