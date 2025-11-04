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

  async findAll(): Promise<Account[]> {
    const accounts = await prisma.account.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return accounts.map(
      (acc: any) => new Account(acc.id, acc.name, acc.createdAt, acc.updatedAt)
    );
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

  async update(id: string, account: Partial<Account>): Promise<Account> {
    const updated = await prisma.account.update({
      where: { id },
      data: {
        name: account.name,
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

    // Try to find existing account
    const existing = await prisma.account.findUnique({
      where: { id: account.id },
    });

    if (existing) {
      // Update existing
      const updated = await prisma.account.update({
        where: { id: account.id },
        data: { name: account.name },
      });
      return new Account(
        updated.id,
        updated.name,
        updated.createdAt,
        updated.updatedAt
      );
    } else {
      // Create new with provided ID
      const created = await prisma.account.create({
        data: {
          id: account.id,
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
  }
}

