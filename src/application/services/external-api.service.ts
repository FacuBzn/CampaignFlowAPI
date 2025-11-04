import { MetaApiClient, MetaApiAccount, MetaApiCampaign } from '../../infrastructure/http/meta-api.client';

export class ExternalApiService {
  private metaApiClient: MetaApiClient;

  constructor() {
    this.metaApiClient = new MetaApiClient();
  }

  async fetchAccounts(): Promise<MetaApiAccount[]> {
    return await this.metaApiClient.getAccounts();
  }

  async fetchCampaigns(accountId: string, cursor?: string): Promise<{
    items: MetaApiCampaign[];
    nextCursor?: string;
  }> {
    const response = await this.metaApiClient.getCampaigns(accountId, cursor);
    return {
      items: response.items || [],
      nextCursor: response.pagination?.next_cursor,
    };
  }
}

