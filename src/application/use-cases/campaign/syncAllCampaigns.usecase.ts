import { IAccountRepository } from '../../../domain/repositories/account.repository';
import { DIContainer } from '../../../infrastructure/di/container';
import { SyncCampaignsUseCase } from './syncCampaigns.usecase';
import { Campaign } from '../../../domain/entities/campaign.entity';

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
  private readonly SYNC_TIMEOUT = Number(process.env.SYNC_ALL_TIMEOUT) || 300000; // 5 minutos default

  constructor(
    accountRepository?: IAccountRepository,
    syncCampaignsUseCase?: SyncCampaignsUseCase
  ) {
    this.accountRepository = accountRepository || DIContainer.getAccountRepository();
    this.syncCampaignsUseCase = syncCampaignsUseCase || DIContainer.getSyncCampaignsUseCase();
  }

  async execute(): Promise<SyncAllResult> {
    // Crear timeout promise
    const timeoutPromise = new Promise<SyncAllResult>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Sync operation timed out after ${this.SYNC_TIMEOUT}ms`));
      }, this.SYNC_TIMEOUT);
    });

    // Race entre sync y timeout
    try {
      return await Promise.race([
        this.executeSync(),
        timeoutPromise,
      ]);
    } catch (error) {
      // Si es timeout, retornar estado parcial
      if (error instanceof Error && error.message.includes('timeout')) {
        return this.getPartialResult();
      }
      throw error;
    }
  }

  private async executeSync(): Promise<SyncAllResult> {
    // Get all accounts
    const accounts = await this.accountRepository.findAll();

    // Sync campaigns for all accounts concurrently
    const syncPromises = accounts.map(account =>
      this.syncCampaignsUseCase.execute(account.id)
    );

    const results = await Promise.allSettled(syncPromises);

    return this.processResults(results, accounts);
  }

  private processResults(
    results: PromiseSettledResult<Campaign[]>[],
    accounts: Account[]
  ): SyncAllResult {
    const syncResults: SyncAllResult['results'] = [];
    let succeeded = 0;
    let failed = 0;

    results.forEach((result: PromiseSettledResult<Campaign[]>, index: number) => {
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

  private getPartialResult(): SyncAllResult {
    // Retornar estado indicando timeout
    return {
      total: 0,
      succeeded: 0,
      failed: 0,
      results: [{
        accountId: 'timeout',
        status: 'failed',
        error: 'Operation timed out',
      }],
    };
  }
}

