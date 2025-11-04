import { IAccountRepository } from '../../../domain/repositories/account.repository';
import { AccountPrismaRepository } from '../../../infrastructure/repositories/account.prisma.repository';
import { Account } from '../../../domain/entities/account.entity';

export class GetAccountsUseCase {
  private accountRepository: IAccountRepository;

  constructor(accountRepository?: IAccountRepository) {
    this.accountRepository = accountRepository || new AccountPrismaRepository();
  }

  async execute(): Promise<Account[]> {
    return await this.accountRepository.findAll();
  }
}

