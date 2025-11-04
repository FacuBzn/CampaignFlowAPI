import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import { accountRoutes } from '../../../../src/api/routes/account.routes';
import { GetAccountsUseCase } from '../../../../src/application/use-cases/account/getAccounts.usecase';
import { CreateAccountUseCase } from '../../../../src/application/use-cases/account/createAccount.usecase';
import { SyncAccountsUseCase } from '../../../../src/application/use-cases/account/syncAccounts.usecase';
import { Account } from '../../../../src/domain/entities/account.entity';

describe('AccountController Integration', () => {
  let app: any;

  beforeEach(async () => {
    app = Fastify({ logger: false });
    await app.register(accountRoutes);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should get all accounts', async () => {
    // Mock the use case
    const mockAccount = new Account('123', 'Test Account', new Date(), new Date());
    vi.spyOn(GetAccountsUseCase.prototype, 'execute').mockResolvedValue([mockAccount]);

    const response = await app.inject({
      method: 'GET',
      url: '/accounts',
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].name).toBe('Test Account');
  });

  it('should create a new account', async () => {
    const mockAccount = new Account('123', 'New Account', new Date(), new Date());
    vi.spyOn(CreateAccountUseCase.prototype, 'execute').mockResolvedValue(mockAccount);

    const response = await app.inject({
      method: 'POST',
      url: '/accounts',
      payload: {
        name: 'New Account',
      },
    });

    expect(response.statusCode).toBe(201);
    const data = JSON.parse(response.body);
    expect(data.data.name).toBe('New Account');
  });

  it('should sync accounts from external API', async () => {
    const mockAccounts = [
      new Account('123', 'Synced Account 1', new Date(), new Date()),
      new Account('456', 'Synced Account 2', new Date(), new Date()),
    ];
    vi.spyOn(SyncAccountsUseCase.prototype, 'execute').mockResolvedValue(mockAccounts);

    const response = await app.inject({
      method: 'POST',
      url: '/accounts/sync',
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.data).toHaveLength(2);
  });
});

