import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncCampaignsUseCase } from '../../../../src/application/use-cases/campaign/syncCampaigns.usecase';
import { ICampaignRepository } from '../../../../src/domain/repositories/campaign.repository';
import { ExternalApiService } from '../../../../src/application/services/external-api.service';
import { Campaign } from '../../../../src/domain/entities/campaign.entity';

describe('SyncCampaignsUseCase', () => {
  let mockCampaignRepository: ICampaignRepository;
  let mockExternalApiService: ExternalApiService;
  let useCase: SyncCampaignsUseCase;

  beforeEach(() => {
    mockCampaignRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      findByAccountId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    };

    mockExternalApiService = {
      fetchCampaigns: vi.fn(),
      fetchAccounts: vi.fn(),
    } as any;

    useCase = new SyncCampaignsUseCase(mockCampaignRepository, mockExternalApiService);
  });

  it('should sync campaigns with pagination', async () => {
    const accountId = 'account-123';
    const campaign1 = {
      id: 'campaign-1',
      name: 'Campaign 1',
      status: 'ACTIVE',
      spend: 100,
      budget: 1000,
    };
    const campaign2 = {
      id: 'campaign-2',
      name: 'Campaign 2',
      status: 'PAUSED',
      spend: 200,
      budget: 2000,
    };

    // Mock first page
    vi.mocked(mockExternalApiService.fetchCampaigns).mockResolvedValueOnce({
      items: [campaign1],
      nextCursor: 'cursor-2',
    });

    // Mock second page (last page)
    vi.mocked(mockExternalApiService.fetchCampaigns).mockResolvedValueOnce({
      items: [campaign2],
      nextCursor: undefined,
    });

    // Mock upsert calls
    const mockCampaign1 = new Campaign(
      campaign1.id,
      campaign1.name,
      campaign1.status,
      campaign1.spend,
      campaign1.budget,
      accountId,
      new Date(),
      new Date()
    );
    const mockCampaign2 = new Campaign(
      campaign2.id,
      campaign2.name,
      campaign2.status,
      campaign2.spend,
      campaign2.budget,
      accountId,
      new Date(),
      new Date()
    );

    vi.mocked(mockCampaignRepository.upsert).mockResolvedValueOnce(mockCampaign1);
    vi.mocked(mockCampaignRepository.upsert).mockResolvedValueOnce(mockCampaign2);

    const result = await useCase.execute(accountId);

    expect(result).toHaveLength(2);
    expect(mockExternalApiService.fetchCampaigns).toHaveBeenCalledTimes(2);
    expect(mockCampaignRepository.upsert).toHaveBeenCalledTimes(2);
  });

  it('should handle empty campaign list', async () => {
    const accountId = 'account-123';

    vi.mocked(mockExternalApiService.fetchCampaigns).mockResolvedValueOnce({
      items: [],
      nextCursor: undefined,
    });

    const result = await useCase.execute(accountId);

    expect(result).toHaveLength(0);
    expect(mockCampaignRepository.upsert).not.toHaveBeenCalled();
  });
});

