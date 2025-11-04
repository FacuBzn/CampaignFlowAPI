import { IAccountRepository } from '../../../domain/repositories/account.repository';
import { DIContainer } from '../../../infrastructure/di/container';
import { Account } from '../../../domain/entities/account.entity';

export class GetAccountsUseCase {
  private accountRepository: IAccountRepository;

  constructor(accountRepository?: IAccountRepository) {
    this.accountRepository = accountRepository || DIContainer.getAccountRepository();
  }

  async execute(): Promise<Account[]> {
    return await this.accountRepository.findAll();
  }
}

