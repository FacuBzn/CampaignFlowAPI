import axios, { AxiosInstance } from 'axios';

const BASE_URL =
  process.env.META_API_BASE_URL ||
  'https://w5k577bkq5cmihbdxxqlok2c7y0ejbiz.lambda-url.us-east-1.on.aws';

const TIMEOUT = Number(process.env.META_API_TIMEOUT) || 30000;

export interface MetaApiAccount {
  id: string;
  name: string;
}

export interface MetaApiCampaign {
  id: string;
  name: string;
  status: string;
  spend: number;
  budget: number;
}

export interface MetaApiResponse<T> {
  items: T[];
  pagination?: {
    next_cursor?: string;
  };
}

export class MetaApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: TIMEOUT,
    });
  }

  async getAccounts(): Promise<MetaApiAccount[]> {
    // Assuming the API returns accounts directly or we need to adjust based on actual API structure
    const response = await this.client.get<MetaApiResponse<MetaApiAccount>>('');
    return response.data.items || [];
  }

  async getCampaigns(accountId: string, cursor?: string): Promise<MetaApiResponse<MetaApiCampaign>> {
    const url = `?account_id=${accountId}${cursor ? `&cursor=${cursor}` : ''}`;
    const response = await this.client.get<MetaApiResponse<MetaApiCampaign>>(url);
    return response.data;
  }
}

