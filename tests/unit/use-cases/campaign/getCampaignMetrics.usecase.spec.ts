import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetCampaignMetricsUseCase } from '../../../../src/application/use-cases/campaign/getCampaignMetrics.usecase';
import { ICampaignRepository } from '../../../../src/domain/repositories/campaign.repository';
import { Campaign } from '../../../../src/domain/entities/campaign.entity';

describe('GetCampaignMetricsUseCase', () => {
  let mockCampaignRepository: ICampaignRepository;
  let useCase: GetCampaignMetricsUseCase;

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

    useCase = new GetCampaignMetricsUseCase(mockCampaignRepository);
  });

  it('should calculate metrics correctly for campaigns', async () => {
    const accountId = 'account-123';
    const createdDate = new Date();
    const updatedDate = new Date();
    const campaigns = [
      new Campaign('camp-1', 'Campaign 1', 'ACTIVE', 100, 1000, accountId, createdDate, updatedDate),
      new Campaign('camp-2', 'Campaign 2', 'PAUSED', 200, 2000, accountId, createdDate, updatedDate),
      new Campaign('camp-3', 'Campaign 3', 'ACTIVE', 150, 1500, accountId, createdDate, updatedDate),
    ];

    vi.mocked(mockCampaignRepository.findByAccountId).mockResolvedValue(campaigns);

    const result = await useCase.execute(accountId);

    expect(result).toEqual({
      accountId: 'account-123',
      totalCampaigns: 3,
      totalSpend: 450,
      totalBudget: 4500,
    });
    expect(mockCampaignRepository.findByAccountId).toHaveBeenCalledTimes(1);
    expect(mockCampaignRepository.findByAccountId).toHaveBeenCalledWith(accountId);
  });

  it('should return zero metrics when no campaigns exist', async () => {
    const accountId = 'account-123';

    vi.mocked(mockCampaignRepository.findByAccountId).mockResolvedValue([]);

    const result = await useCase.execute(accountId);

    expect(result).toEqual({
      accountId: 'account-123',
      totalCampaigns: 0,
      totalSpend: 0,
      totalBudget: 0,
    });
    expect(mockCampaignRepository.findByAccountId).toHaveBeenCalledTimes(1);
  });

  it('should handle campaigns with zero spend and budget', async () => {
    const accountId = 'account-123';
    const createdDate = new Date();
    const updatedDate = new Date();
    const campaigns = [
      new Campaign('camp-1', 'Campaign 1', 'ACTIVE', 0, 0, accountId, createdDate, updatedDate),
    ];

    vi.mocked(mockCampaignRepository.findByAccountId).mockResolvedValue(campaigns);

    const result = await useCase.execute(accountId);

    expect(result).toEqual({
      accountId: 'account-123',
      totalCampaigns: 1,
      totalSpend: 0,
      totalBudget: 0,
    });
  });

  it('should throw error when repository fails', async () => {
    const accountId = 'account-123';
    const error = new Error('Database error');

    vi.mocked(mockCampaignRepository.findByAccountId).mockRejectedValue(error);

    await expect(useCase.execute(accountId)).rejects.toThrow('Database error');
    expect(mockCampaignRepository.findByAccountId).toHaveBeenCalledTimes(1);
  });
});

