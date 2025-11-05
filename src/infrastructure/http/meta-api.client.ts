import axios, { AxiosInstance, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { ExternalApiError } from '../../domain/errors/external-api.error';

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
    previous_cursor?: string;
  };
}

export class MetaApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: TIMEOUT,
    });

    // Configurar retry
    axiosRetry(this.client, {
      retries: Number(process.env.META_API_RETRY_ATTEMPTS) || 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        // Solo retry en errores retryables
        if (error.response) {
          const status = error.response.status;
          // Retry en 5xx, 429 (rate limit), y timeouts
          return status >= 500 || status === 429;
        }
        // Retry en network errors y timeouts
        return error.code === 'ECONNABORTED' || 
               error.code === 'ENOTFOUND' || 
               error.code === 'ECONNREFUSED';
      },
      onRetry: (retryCount, _error, requestConfig) => {
        console.log(`Retry attempt ${retryCount} for ${requestConfig.url}`);
      },
    });

    // Interceptor para manejo de errores (después de retries)
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ExternalApiError {
    // Timeout
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new ExternalApiError(
        `Request to external API timed out after ${TIMEOUT}ms`,
        error,
        true // Retryable
      );
    }

    // Network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return new ExternalApiError(
        `Network error connecting to external API: ${error.message}`,
        error,
        true // Retryable
      );
    }

    // HTTP errors
    if (error.response) {
      const status = error.response.status;
      
      // 4xx - Client errors (no retryable)
      if (status >= 400 && status < 500) {
        const url = error.config?.url || 'unknown';
        const fullUrl = `${error.config?.baseURL || BASE_URL}${url}`;
        return new ExternalApiError(
          `External API returned ${status}: ${error.response.statusText}. Endpoint: ${fullUrl}`,
          error,
          false // Not retryable
        );
      }

      // 5xx - Server errors (retryable)
      if (status >= 500) {
        return new ExternalApiError(
          `External API server error ${status}: ${error.response.statusText}`,
          error,
          true // Retryable
        );
      }

      // Rate limiting (429)
      if (status === 429) {
        return new ExternalApiError(
          'External API rate limit exceeded',
          error,
          true // Retryable with backoff
        );
      }
    }

    // Unknown error
    return new ExternalApiError(
      `Unknown error calling external API: ${error.message}`,
      error,
      false
    );
  }

  /**
   * Returns the predefined account IDs supported by the external API.
   * The API does not expose an endpoint to list accounts, only to get campaigns by account_id.
   * According to the API documentation, there are 5 predefined accounts: acct1, acct2, acct3, acct4, acct5
   */
  async getAccounts(): Promise<MetaApiAccount[]> {
    // The external API does not have an endpoint to list accounts.
    // According to the documentation, there are 5 predefined accounts with IDs: acct1, acct2, acct3, acct4, acct5
    const predefinedAccountIds = ['acct1', 'acct2', 'acct3', 'acct4', 'acct5'];
    
    return predefinedAccountIds.map(id => ({
      id,
      name: `Account ${id.replace('acct', '')}`, // Generate a default name based on ID
    }));
  }

  /**
   * Gets campaigns for a specific account ID with optional cursor for pagination.
   * Endpoint: GET ?account_id={acct_id}&cursor={cursor}
   * 
   * @param accountId - The account ID (must be one of: acct1, acct2, acct3, acct4, acct5)
   * @param cursor - Optional cursor for pagination
   * @returns Campaigns with pagination info
   */
  async getCampaigns(accountId: string, cursor?: string): Promise<MetaApiResponse<MetaApiCampaign>> {
    const url = `?account_id=${accountId}${cursor ? `&cursor=${cursor}` : ''}`;
    const response = await this.client.get<MetaApiResponse<MetaApiCampaign>>(url);
    return response.data;
  }
}

