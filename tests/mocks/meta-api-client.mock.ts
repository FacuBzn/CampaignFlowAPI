import { vi } from 'vitest';
import { MetaApiClient, MetaApiAccount, MetaApiCampaign, MetaApiResponse } from '../../src/infrastructure/http/meta-api.client';

export const createMockMetaApiClient = (): MetaApiClient => {
  const mockClient = {
    getAccounts: vi.fn<(), Promise<MetaApiAccount[]>>(),
    getCampaigns: vi.fn<(accountId: string, cursor?: string) => Promise<MetaApiResponse<MetaApiCampaign>>>(),
  } as any;

  return mockClient;
};

export const createMockAccounts = (): MetaApiAccount[] => {
  return [
    { id: 'acct1', name: 'Account 1' },
    { id: 'acct2', name: 'Account 2' },
    { id: 'acct3', name: 'Account 3' },
    { id: 'acct4', name: 'Account 4' },
    { id: 'acct5', name: 'Account 5' },
  ];
};

export const createMockCampaigns = (accountId: string): MetaApiCampaign[] => {
  return [
    { id: 'camp-1', name: 'Campaign 1', status: 'ACTIVE', spend: 100, budget: 1000 },
    { id: 'camp-2', name: 'Campaign 2', status: 'PAUSED', spend: 200, budget: 2000 },
    { id: 'camp-3', name: 'Campaign 3', status: 'ACTIVE', spend: 150, budget: 1500 },
  ];
};

export const createMockCampaignResponse = (
  accountId: string,
  cursor?: string
): MetaApiResponse<MetaApiCampaign> => {
  const items = createMockCampaigns(accountId);
  return {
    items,
    pagination: cursor
      ? { next_cursor: `cursor-${cursor}` }
      : undefined,
  };
};

