import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncAllCampaignsUseCase } from '../../../../src/application/use-cases/campaign/syncAllCampaigns.usecase';
import { IAccountRepository } from '../../../../src/domain/repositories/account.repository';
import { SyncCampaignsUseCase } from '../../../../src/application/use-cases/campaign/syncCampaigns.usecase';
import { Account } from '../../../../src/domain/entities/account.entity';
import { Campaign } from '../../../../src/domain/entities/campaign.entity';

describe('SyncAllCampaignsUseCase', () => {
  let mockAccountRepository: IAccountRepository;
  let mockSyncCampaignsUseCase: SyncCampaignsUseCase;
  let useCase: SyncAllCampaignsUseCase;

  beforeEach(() => {
    mockAccountRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    };

    mockSyncCampaignsUseCase = {
      execute: vi.fn(),
    } as any;

    useCase = new SyncAllCampaignsUseCase(mockAccountRepository, mockSyncCampaignsUseCase);
  });

  it('should sync campaigns for all accounts concurrently', async () => {
    const createdDate = new Date();
    const updatedDate = new Date();
    const accounts = [
      new Account('acct1', 'Account 1', createdDate, updatedDate),
      new Account('acct2', 'Account 2', createdDate, updatedDate),
      new Account('acct3', 'Account 3', createdDate, updatedDate),
    ];

    const campaigns1 = [
      new Campaign('camp-1', 'Campaign 1', 'ACTIVE', 100, 1000, 'acct1', createdDate, updatedDate),
    ];
    const campaigns2 = [
      new Campaign('camp-2', 'Campaign 2', 'PAUSED', 200, 2000, 'acct2', createdDate, updatedDate),
    ];
    const campaigns3: Campaign[] = [];

    vi.mocked(mockAccountRepository.findAll).mockResolvedValue(accounts);
    vi.mocked(mockSyncCampaignsUseCase.execute)
      .mockResolvedValueOnce(campaigns1)
      .mockResolvedValueOnce(campaigns2)
      .mockResolvedValueOnce(campaigns3);

    const result = await useCase.execute();

    expect(result.total).toBe(3);
    expect(result.succeeded).toBe(3);
    expect(result.failed).toBe(0);
    expect(result.results).toHaveLength(3);
    expect(result.results[0].status).toBe('success');
    expect(result.results[1].status).toBe('success');
    expect(result.results[2].status).toBe('success');
    expect(mockSyncCampaignsUseCase.execute).toHaveBeenCalledTimes(3);
  });

  it('should handle partial failures gracefully', async () => {
    const createdDate = new Date();
    const updatedDate = new Date();
    const accounts = [
      new Account('acct1', 'Account 1', createdDate, updatedDate),
      new Account('acct2', 'Account 2', createdDate, updatedDate),
    ];

    const campaigns1 = [
      new Campaign('camp-1', 'Campaign 1', 'ACTIVE', 100, 1000, 'acct1', createdDate, updatedDate),
    ];

    vi.mocked(mockAccountRepository.findAll).mockResolvedValue(accounts);
    vi.mocked(mockSyncCampaignsUseCase.execute)
      .mockResolvedValueOnce(campaigns1)
      .mockRejectedValueOnce(new Error('Sync failed for acct2'));

    const result = await useCase.execute();

    expect(result.total).toBe(2);
    expect(result.succeeded).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.results).toHaveLength(2);
    expect(result.results[0].status).toBe('success');
    expect(result.results[1].status).toBe('failed');
    expect(result.results[1].error).toBe('Sync failed for acct2');
  });

  it('should handle all failures', async () => {
    const createdDate = new Date();
    const updatedDate = new Date();
    const accounts = [
      new Account('acct1', 'Account 1', createdDate, updatedDate),
      new Account('acct2', 'Account 2', createdDate, updatedDate),
    ];

    vi.mocked(mockAccountRepository.findAll).mockResolvedValue(accounts);
    vi.mocked(mockSyncCampaignsUseCase.execute)
      .mockRejectedValueOnce(new Error('Sync failed for acct1'))
      .mockRejectedValueOnce(new Error('Sync failed for acct2'));

    const result = await useCase.execute();

    expect(result.total).toBe(2);
    expect(result.succeeded).toBe(0);
    expect(result.failed).toBe(2);
    expect(result.results).toHaveLength(2);
    expect(result.results[0].status).toBe('failed');
    expect(result.results[1].status).toBe('failed');
  });

  it('should handle empty accounts list', async () => {
    vi.mocked(mockAccountRepository.findAll).mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result.total).toBe(0);
    expect(result.succeeded).toBe(0);
    expect(result.failed).toBe(0);
    expect(result.results).toEqual([]);
    expect(mockSyncCampaignsUseCase.execute).not.toHaveBeenCalled();
  });

  it('should handle unknown errors in results', async () => {
    const createdDate = new Date();
    const updatedDate = new Date();
    const accounts = [new Account('acct1', 'Account 1', createdDate, updatedDate)];

    vi.mocked(mockAccountRepository.findAll).mockResolvedValue(accounts);
    vi.mocked(mockSyncCampaignsUseCase.execute).mockRejectedValueOnce(null);

    const result = await useCase.execute();

    expect(result.total).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.results[0].status).toBe('failed');
    expect(result.results[0].error).toBe('Unknown error');
  });
});

