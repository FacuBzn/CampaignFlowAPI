import { Account } from '../entities/account.entity';

export interface SortOptions {
  orderBy?: 'createdAt' | 'updatedAt' | 'name';
  orderDirection?: 'asc' | 'desc';
}

export interface IAccountRepository {
  create(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account>;
  findAll(options?: { 
    limit?: number; 
    offset?: number;
    sort?: SortOptions;
  }): Promise<Account[]>;
  findById(id: string): Promise<Account | null>;
  update(id: string, account: { name: string }): Promise<Account>;
  delete(id: string): Promise<void>;
  upsert(account: { id?: string; name: string }): Promise<Account>;
  count(): Promise<number>;
}

