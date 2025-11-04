import { Account } from '../entities/account.entity';

export interface IAccountRepository {
  create(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account>;
  findAll(): Promise<Account[]>;
  findById(id: string): Promise<Account | null>;
  update(id: string, account: Partial<Account>): Promise<Account>;
  delete(id: string): Promise<void>;
  upsert(account: { id?: string; name: string }): Promise<Account>;
}

