import { IAccountRepository } from '../../../domain/repositories/account.repository';
import { DIContainer } from '../../../infrastructure/di/container';
import { Account } from '../../../domain/entities/account.entity';

export interface GetAccountsInput {
  limit?: number;
  offset?: number;
  sort?: {
    orderBy?: 'createdAt' | 'updatedAt' | 'name';
    orderDirection?: 'asc' | 'desc';
  };
}

export interface GetAccountsOutput {
  data: Account[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export class GetAccountsUseCase {
  private accountRepository: IAccountRepository;

  constructor(accountRepository?: IAccountRepository) {
    this.accountRepository = accountRepository || DIContainer.getAccountRepository();
  }

  async execute(input?: GetAccountsInput): Promise<GetAccountsOutput> {
    const limit = input?.limit ?? 20;
    const offset = input?.offset ?? 0;

    const [accounts, total] = await Promise.all([
      this.accountRepository.findAll({ limit, offset, sort: input?.sort }),
      this.accountRepository.count(),
    ]);

    return {
      data: accounts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + accounts.length < total,
      },
    };
  }
}

