import { IAccountRepository } from '../../../domain/repositories/account.repository';
import { AccountPrismaRepository } from '../../../infrastructure/repositories/account.prisma.repository';
import { Account } from '../../../domain/entities/account.entity';

export class CreateAccountUseCase {
  private accountRepository: IAccountRepository;

  constructor(accountRepository?: IAccountRepository) {
    this.accountRepository = accountRepository || new AccountPrismaRepository();
  }

  async execute(input: { name: string }): Promise<Account> {
    return await this.accountRepository.create({
      name: input.name,
    });
  }
}

