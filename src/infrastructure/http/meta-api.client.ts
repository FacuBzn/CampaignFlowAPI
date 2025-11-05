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
      onRetry: (retryCount, error, requestConfig) => {
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
        return new ExternalApiError(
          `External API returned ${status}: ${error.response.statusText}`,
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

  async getAccounts(): Promise<MetaApiAccount[]> {
    try {
      const response = await this.client.get<MetaApiResponse<MetaApiAccount>>('');
      return response.data.items || [];
    } catch (error) {
      // Error ya está transformado por interceptor
      throw error;
    }
  }

  async getCampaigns(accountId: string, cursor?: string): Promise<MetaApiResponse<MetaApiCampaign>> {
    try {
      const url = `?account_id=${accountId}${cursor ? `&cursor=${cursor}` : ''}`;
      const response = await this.client.get<MetaApiResponse<MetaApiCampaign>>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

