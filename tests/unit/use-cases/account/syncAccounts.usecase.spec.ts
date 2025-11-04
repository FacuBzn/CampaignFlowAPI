import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncAccountsUseCase } from '../../../../src/application/use-cases/account/syncAccounts.usecase';
import { IAccountRepository } from '../../../../src/domain/repositories/account.repository';
import { ExternalApiService } from '../../../../src/application/services/external-api.service';
import { Account } from '../../../../src/domain/entities/account.entity';
import { MetaApiAccount } from '../../../../src/infrastructure/http/meta-api.client';

describe('SyncAccountsUseCase', () => {
  let mockAccountRepository: IAccountRepository;
  let mockExternalApiService: ExternalApiService;
  let useCase: SyncAccountsUseCase;

  beforeEach(() => {
    mockAccountRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    };

    mockExternalApiService = {
      fetchAccounts: vi.fn(),
      fetchCampaigns: vi.fn(),
    } as any;

    useCase = new SyncAccountsUseCase(mockAccountRepository, mockExternalApiService);
  });

  it('should sync accounts from external API successfully', async () => {
    const externalAccounts: MetaApiAccount[] = [
      { id: 'acct1', name: 'Account 1' },
      { id: 'acct2', name: 'Account 2' },
      { id: 'acct3', name: 'Account 3' },
    ];

    const createdDate = new Date();
    const updatedDate = new Date();
    const syncedAccounts = externalAccounts.map(
      (acc) => new Account(acc.id, acc.name, createdDate, updatedDate)
    );

    vi.mocked(mockExternalApiService.fetchAccounts).mockResolvedValue(externalAccounts);
    vi.mocked(mockAccountRepository.upsert)
      .mockResolvedValueOnce(syncedAccounts[0])
      .mockResolvedValueOnce(syncedAccounts[1])
      .mockResolvedValueOnce(syncedAccounts[2]);

    const result = await useCase.execute();

    expect(result).toHaveLength(3);
    expect(mockExternalApiService.fetchAccounts).toHaveBeenCalledTimes(1);
    expect(mockAccountRepository.upsert).toHaveBeenCalledTimes(3);
    expect(mockAccountRepository.upsert).toHaveBeenNthCalledWith(1, {
      id: 'acct1',
      name: 'Account 1',
    });
    expect(mockAccountRepository.upsert).toHaveBeenNthCalledWith(2, {
      id: 'acct2',
      name: 'Account 2',
    });
    expect(mockAccountRepository.upsert).toHaveBeenNthCalledWith(3, {
      id: 'acct3',
      name: 'Account 3',
    });
  });

  it('should handle empty accounts list from external API', async () => {
    vi.mocked(mockExternalApiService.fetchAccounts).mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
    expect(mockExternalApiService.fetchAccounts).toHaveBeenCalledTimes(1);
    expect(mockAccountRepository.upsert).not.toHaveBeenCalled();
  });

  it('should throw error when external API fails', async () => {
    const error = new Error('API connection error');

    vi.mocked(mockExternalApiService.fetchAccounts).mockRejectedValue(error);

    await expect(useCase.execute()).rejects.toThrow('API connection error');
    expect(mockExternalApiService.fetchAccounts).toHaveBeenCalledTimes(1);
    expect(mockAccountRepository.upsert).not.toHaveBeenCalled();
  });

  it('should handle partial failures during upsert', async () => {
    const externalAccounts: MetaApiAccount[] = [
      { id: 'acct1', name: 'Account 1' },
      { id: 'acct2', name: 'Account 2' },
    ];

    const createdDate = new Date();
    const updatedDate = new Date();
    const firstAccount = new Account('acct1', 'Account 1', createdDate, updatedDate);

    vi.mocked(mockExternalApiService.fetchAccounts).mockResolvedValue(externalAccounts);
    vi.mocked(mockAccountRepository.upsert)
      .mockResolvedValueOnce(firstAccount)
      .mockRejectedValueOnce(new Error('Upsert failed'));

    await expect(useCase.execute()).rejects.toThrow('Upsert failed');
    expect(mockAccountRepository.upsert).toHaveBeenCalledTimes(2);
  });
});

