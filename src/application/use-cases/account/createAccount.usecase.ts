import { IAccountRepository } from '../../../domain/repositories/account.repository';
import { DIContainer } from '../../../infrastructure/di/container';
import { Account } from '../../../domain/entities/account.entity';

export class CreateAccountUseCase {
  private accountRepository: IAccountRepository;

  constructor(accountRepository?: IAccountRepository) {
    this.accountRepository = accountRepository || DIContainer.getAccountRepository();
  }

  async execute(input: { name: string }): Promise<Account> {
    return await this.accountRepository.create({
      name: input.name,
    });
  }
}

