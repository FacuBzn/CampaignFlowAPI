import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExternalApiService } from '../../../src/application/services/external-api.service';
import { MetaApiClient, MetaApiAccount, MetaApiCampaign } from '../../../src/infrastructure/http/meta-api.client';

describe('ExternalApiService', () => {
  let mockMetaApiClient: MetaApiClient;
  let service: ExternalApiService;

  beforeEach(() => {
    mockMetaApiClient = {
      getAccounts: vi.fn(),
      getCampaigns: vi.fn(),
    } as any;

    // We need to inject the mock client, but the service creates it internally
    // So we'll test the integration with the actual client and mock axios
    service = new ExternalApiService();
  });

  it('should fetch accounts from external API', async () => {
    const mockAccounts: MetaApiAccount[] = [
      { id: 'acct1', name: 'Account 1' },
      { id: 'acct2', name: 'Account 2' },
    ];

    // Mock the internal client by spying on the service
    const fetchAccountsSpy = vi.spyOn(service as any, 'metaApiClient').mockImplementation({
      getAccounts: vi.fn().mockResolvedValue(mockAccounts),
    });

    const result = await service.fetchAccounts();

    expect(result).toEqual(mockAccounts);
  });

  it('should fetch campaigns with pagination', async () => {
    const accountId = 'acct1';
    const mockResponse = {
      items: [
        { id: 'camp-1', name: 'Campaign 1', status: 'ACTIVE', spend: 100, budget: 1000 },
        { id: 'camp-2', name: 'Campaign 2', status: 'PAUSED', spend: 200, budget: 2000 },
      ],
      pagination: {
        next_cursor: 'cursor-123',
      },
    };

    const fetchCampaignsSpy = vi.spyOn(service as any, 'metaApiClient').mockImplementation({
      getCampaigns: vi.fn().mockResolvedValue(mockResponse),
    });

    const result = await service.fetchCampaigns(accountId);

    expect(result.items).toEqual(mockResponse.items);
    expect(result.nextCursor).toBe('cursor-123');
  });

  it('should handle campaigns without pagination', async () => {
    const accountId = 'acct1';
    const mockResponse = {
      items: [
        { id: 'camp-1', name: 'Campaign 1', status: 'ACTIVE', spend: 100, budget: 1000 },
      ],
      pagination: undefined,
    };

    const fetchCampaignsSpy = vi.spyOn(service as any, 'metaApiClient').mockImplementation({
      getCampaigns: vi.fn().mockResolvedValue(mockResponse),
    });

    const result = await service.fetchCampaigns(accountId);

    expect(result.items).toEqual(mockResponse.items);
    expect(result.nextCursor).toBeUndefined();
  });

  it('should handle empty campaigns list', async () => {
    const accountId = 'acct1';
    const mockResponse = {
      items: [],
      pagination: undefined,
    };

    const fetchCampaignsSpy = vi.spyOn(service as any, 'metaApiClient').mockImplementation({
      getCampaigns: vi.fn().mockResolvedValue(mockResponse),
    });

    const result = await service.fetchCampaigns(accountId);

    expect(result.items).toEqual([]);
    expect(result.items).toHaveLength(0);
  });

  it('should handle API errors', async () => {
    const error = new Error('API connection failed');

    const fetchAccountsSpy = vi.spyOn(service as any, 'metaApiClient').mockImplementation({
      getAccounts: vi.fn().mockRejectedValue(error),
    });

    await expect(service.fetchAccounts()).rejects.toThrow('API connection failed');
  });
});

