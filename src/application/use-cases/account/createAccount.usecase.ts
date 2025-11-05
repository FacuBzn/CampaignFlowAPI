import { IAccountRepository } from '../../../domain/repositories/account.repository';
import { DIContainer } from '../../../infrastructure/di/container';
import { Account } from '../../../domain/entities/account.entity';
import { ValidationError } from '../../../domain/errors/validation.error';

export class CreateAccountUseCase {
  private accountRepository: IAccountRepository;

  constructor(accountRepository?: IAccountRepository) {
    this.accountRepository = accountRepository || DIContainer.getAccountRepository();
  }

  async execute(input: { name: string }): Promise<Account> {
    // Validar longitud (ya validado por Zod, pero doble verificación)
    if (input.name.length > 255) {
      throw new ValidationError('Name cannot exceed 255 characters', {
        name: ['Name cannot exceed 255 characters'],
      });
    }

    return await this.accountRepository.create({
      name: input.name.trim(),
    });
  }
}

