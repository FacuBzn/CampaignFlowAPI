import { IAccountRepository } from '../../domain/repositories/account.repository';
import { AccountPrismaRepository } from '../../../infrastructure/repositories/account.prisma.repository';
import { SyncCampaignsUseCase } from './syncCampaigns.usecase';

export interface SyncAllResult {
  total: number;
  succeeded: number;
  failed: number;
  results: Array<{
    accountId: string;
    status: 'success' | 'failed';
    error?: string;
  }>;
}

export class SyncAllCampaignsUseCase {
  private accountRepository: IAccountRepository;
  private syncCampaignsUseCase: SyncCampaignsUseCase;

  constructor(
    accountRepository?: IAccountRepository,
    syncCampaignsUseCase?: SyncCampaignsUseCase
  ) {
    this.accountRepository = accountRepository || new AccountPrismaRepository();
    this.syncCampaignsUseCase = syncCampaignsUseCase || new SyncCampaignsUseCase();
  }

  async execute(): Promise<SyncAllResult> {
    // Get all accounts
    const accounts = await this.accountRepository.findAll();

    // Sync campaigns for all accounts concurrently
    const syncPromises = accounts.map((account: any) =>
      this.syncCampaignsUseCase.execute(account.id)
    );

    const results = await Promise.allSettled(syncPromises);

    // Process results
    const syncResults: SyncAllResult['results'] = [];
    let succeeded = 0;
    let failed = 0;

    results.forEach((result: PromiseSettledResult<any>, index: number) => {
      const account = accounts[index];
      if (result.status === 'fulfilled') {
        succeeded++;
        syncResults.push({
          accountId: account.id,
          status: 'success',
        });
      } else {
        failed++;
        syncResults.push({
          accountId: account.id,
          status: 'failed',
          error: result.reason?.message || 'Unknown error',
        });
      }
    });

    return {
      total: accounts.length,
      succeeded,
      failed,
      results: syncResults,
    };
  }
}

