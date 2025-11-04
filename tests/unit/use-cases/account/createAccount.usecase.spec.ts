import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateAccountUseCase } from '../../../../src/application/use-cases/account/createAccount.usecase';
import { IAccountRepository } from '../../../../src/domain/repositories/account.repository';
import { Account } from '../../../../src/domain/entities/account.entity';

describe('CreateAccountUseCase', () => {
  let mockAccountRepository: IAccountRepository;
  let useCase: CreateAccountUseCase;

  beforeEach(() => {
    mockAccountRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    };

    useCase = new CreateAccountUseCase(mockAccountRepository);
  });

  it('should create a new account successfully', async () => {
    const accountData = { name: 'Test Account' };
    const createdDate = new Date();
    const updatedDate = new Date();
    const mockAccount = new Account('account-123', accountData.name, createdDate, updatedDate);

    vi.mocked(mockAccountRepository.create).mockResolvedValue(mockAccount);

    const result = await useCase.execute(accountData);

    expect(result).toEqual(mockAccount);
    expect(mockAccountRepository.create).toHaveBeenCalledTimes(1);
    expect(mockAccountRepository.create).toHaveBeenCalledWith({
      name: accountData.name,
    });
  });

  it('should throw error when repository fails', async () => {
    const accountData = { name: 'Test Account' };
    const error = new Error('Database error');

    vi.mocked(mockAccountRepository.create).mockRejectedValue(error);

    await expect(useCase.execute(accountData)).rejects.toThrow('Database error');
    expect(mockAccountRepository.create).toHaveBeenCalledTimes(1);
  });

  it('should handle empty account name', async () => {
    const accountData = { name: '' };
    const createdDate = new Date();
    const updatedDate = new Date();
    const mockAccount = new Account('account-123', '', createdDate, updatedDate);

    vi.mocked(mockAccountRepository.create).mockResolvedValue(mockAccount);

    const result = await useCase.execute(accountData);

    expect(result).toEqual(mockAccount);
    expect(mockAccountRepository.create).toHaveBeenCalledWith({
      name: '',
    });
  });
});

