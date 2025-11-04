import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetAccountsUseCase } from '../../../../src/application/use-cases/account/getAccounts.usecase';
import { IAccountRepository } from '../../../../src/domain/repositories/account.repository';
import { Account } from '../../../../src/domain/entities/account.entity';

describe('GetAccountsUseCase', () => {
  let mockAccountRepository: IAccountRepository;
  let useCase: GetAccountsUseCase;

  beforeEach(() => {
    mockAccountRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    };

    useCase = new GetAccountsUseCase(mockAccountRepository);
  });

  it('should return all accounts successfully', async () => {
    const createdDate = new Date();
    const updatedDate = new Date();
    const mockAccounts = [
      new Account('account-1', 'Account 1', createdDate, updatedDate),
      new Account('account-2', 'Account 2', createdDate, updatedDate),
      new Account('account-3', 'Account 3', createdDate, updatedDate),
    ];

    vi.mocked(mockAccountRepository.findAll).mockResolvedValue(mockAccounts);

    const result = await useCase.execute();

    expect(result).toEqual(mockAccounts);
    expect(result).toHaveLength(3);
    expect(mockAccountRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when no accounts exist', async () => {
    vi.mocked(mockAccountRepository.findAll).mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
    expect(mockAccountRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should throw error when repository fails', async () => {
    const error = new Error('Database connection error');

    vi.mocked(mockAccountRepository.findAll).mockRejectedValue(error);

    await expect(useCase.execute()).rejects.toThrow('Database connection error');
    expect(mockAccountRepository.findAll).toHaveBeenCalledTimes(1);
  });
});

