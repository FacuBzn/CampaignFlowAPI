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

    service = new ExternalApiService();
    // Replace the internal client with our mock
    (service as any).metaApiClient = mockMetaApiClient;
  });

  it('should fetch accounts from external API', async () => {
    const mockAccounts: MetaApiAccount[] = [
      { id: 'acct1', name: 'Account 1' },
      { id: 'acct2', name: 'Account 2' },
    ];

    vi.mocked(mockMetaApiClient.getAccounts).mockResolvedValue(mockAccounts);

    const result = await service.fetchAccounts();

    expect(result).toEqual(mockAccounts);
    expect(mockMetaApiClient.getAccounts).toHaveBeenCalledTimes(1);
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

    vi.mocked(mockMetaApiClient.getCampaigns).mockResolvedValue(mockResponse);

    const result = await service.fetchCampaigns(accountId);

    expect(result.items).toEqual(mockResponse.items);
    expect(result.nextCursor).toBe('cursor-123');
    expect(mockMetaApiClient.getCampaigns).toHaveBeenCalledWith(accountId, undefined);
  });

  it('should fetch campaigns with cursor', async () => {
    const accountId = 'acct1';
    const cursor = 'cursor-123';
    const mockResponse = {
      items: [
        { id: 'camp-3', name: 'Campaign 3', status: 'ACTIVE', spend: 150, budget: 1500 },
      ],
      pagination: {
        next_cursor: 'cursor-456',
      },
    };

    vi.mocked(mockMetaApiClient.getCampaigns).mockResolvedValue(mockResponse);

    const result = await service.fetchCampaigns(accountId, cursor);

    expect(result.items).toEqual(mockResponse.items);
    expect(result.nextCursor).toBe('cursor-456');
    expect(mockMetaApiClient.getCampaigns).toHaveBeenCalledWith(accountId, cursor);
  });

  it('should handle campaigns without pagination', async () => {
    const accountId = 'acct1';
    const mockResponse = {
      items: [
        { id: 'camp-1', name: 'Campaign 1', status: 'ACTIVE', spend: 100, budget: 1000 },
      ],
      pagination: undefined,
    };

    vi.mocked(mockMetaApiClient.getCampaigns).mockResolvedValue(mockResponse);

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

    vi.mocked(mockMetaApiClient.getCampaigns).mockResolvedValue(mockResponse);

    const result = await service.fetchCampaigns(accountId);

    expect(result.items).toEqual([]);
    expect(result.items).toHaveLength(0);
  });

  it('should handle API errors', async () => {
    const error = new Error('API connection failed');

    vi.mocked(mockMetaApiClient.getAccounts).mockRejectedValue(error);

    await expect(service.fetchAccounts()).rejects.toThrow('API connection failed');
    expect(mockMetaApiClient.getAccounts).toHaveBeenCalledTimes(1);
  });

  it('should handle campaigns response with empty items array', async () => {
    const accountId = 'acct1';
    const mockResponse = {
      items: [],
      pagination: {
        next_cursor: 'cursor-123',
      },
    };

    vi.mocked(mockMetaApiClient.getCampaigns).mockResolvedValue(mockResponse);

    const result = await service.fetchCampaigns(accountId);

    expect(result.items).toEqual([]);
    expect(result.nextCursor).toBe('cursor-123');
  });
});

