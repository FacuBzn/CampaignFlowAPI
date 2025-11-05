import { IAccountRepository } from '../../domain/repositories/account.repository';
import { Account } from '../../domain/entities/account.entity';
import { prisma } from '../database/prisma/prismaClient';

export class AccountPrismaRepository implements IAccountRepository {
  async create(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const created = await prisma.account.create({
      data: {
        name: account.name,
      },
    });

    return new Account(
      created.id,
      created.name,
      created.createdAt,
      created.updatedAt
    );
  }

  async findAll(options?: { 
    limit?: number; 
    offset?: number;
    sort?: { orderBy?: 'createdAt' | 'updatedAt' | 'name'; orderDirection?: 'asc' | 'desc' };
  }): Promise<Account[]> {
    const orderBy = options?.sort?.orderBy || 'createdAt';
    const orderDirection = options?.sort?.orderDirection || 'desc';

    // Validar campo permitido
    const allowedFields = ['createdAt', 'updatedAt', 'name'];
    if (!allowedFields.includes(orderBy)) {
      throw new Error(`Invalid orderBy field: ${orderBy}`);
    }

    const accounts = await prisma.account.findMany({
      take: options?.limit,
      skip: options?.offset,
      orderBy: {
        [orderBy]: orderDirection,
      },
    });

    return accounts.map(
      (acc) => new Account(acc.id, acc.name, acc.createdAt, acc.updatedAt)
    );
  }

  async count(): Promise<number> {
    return prisma.account.count();
  }

  async findById(id: string): Promise<Account | null> {
    const account = await prisma.account.findUnique({
      where: { id },
    });

    if (!account) return null;

    return new Account(
      account.id,
      account.name,
      account.createdAt,
      account.updatedAt
    );
  }

  async update(id: string, account: { name: string }): Promise<Account> {
    // Validar que el account existe
    const existing = await prisma.account.findUnique({ where: { id } });
    if (!existing) {
      const { AccountNotFoundError } = await import('../../domain/errors/account-not-found.error');
      throw new AccountNotFoundError(id);
    }

    // Validar datos
    if (account.name && account.name.length > 255) {
      const { ValidationError } = await import('../../domain/errors/validation.error');
      throw new ValidationError('Name cannot exceed 255 characters', {
        name: ['Name cannot exceed 255 characters'],
      });
    }

    const updated = await prisma.account.update({
      where: { id },
      data: {
        name: account.name?.trim(),
      },
    });

    return new Account(
      updated.id,
      updated.name,
      updated.createdAt,
      updated.updatedAt
    );
  }

  async delete(id: string): Promise<void> {
    await prisma.account.delete({
      where: { id },
    });
  }

  async upsert(account: { id?: string; name: string }): Promise<Account> {
    if (!account.id) {
      // If no ID provided, create new account
      const created = await prisma.account.create({
        data: { name: account.name },
      });
      return new Account(
        created.id,
        created.name,
        created.createdAt,
        created.updatedAt
      );
    }

    // Use Prisma upsert when ID is provided
    const result = await prisma.account.upsert({
      where: { id: account.id },
      update: { name: account.name },
      create: {
        id: account.id,
        name: account.name,
      },
    });

    return new Account(
      result.id,
      result.name,
      result.createdAt,
      result.updatedAt
    );
  }
}

