import { FastifyInstance } from 'fastify';
import { CampaignController } from '../controllers/campaign.controller';

export async function campaignRoutes(server: FastifyInstance) {
  const controller = new CampaignController();

  server.post('/accounts/:id/campaigns/sync', {
    schema: {
      description: 'Sync campaigns for a specific account',
      tags: ['Campaigns'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                synced: { type: 'number' },
                accountId: { type: 'string' },
              },
            },
          },
          example: {
            data: {
              synced: 5,
              accountId: '123e4567-e89b-12d3-a456-426614174000',
            },
          },
        },
      },
    },
  }, controller.syncCampaigns.bind(controller));

  server.get('/accounts/:id/campaigns/metrics', {
    schema: {
      description: 'Get campaign metrics for a specific account',
      tags: ['Campaigns'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                accountId: { type: 'string' },
                totalCampaigns: { type: 'number' },
                totalSpend: { type: 'number' },
                totalBudget: { type: 'number' },
              },
            },
          },
          example: {
            data: {
              accountId: '123e4567-e89b-12d3-a456-426614174000',
              totalCampaigns: 10,
              totalSpend: 5000.50,
              totalBudget: 10000.00,
            },
          },
        },
      },
    },
  }, controller.getMetrics.bind(controller));

  server.post('/sync/all', {
    schema: {
      description: 'Sync all campaigns for all accounts concurrently',
      tags: ['Campaigns'],
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                succeeded: { type: 'number' },
                failed: { type: 'number' },
                results: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      accountId: { type: 'string' },
                      status: { type: 'string' },
                      error: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
          example: {
            data: {
              total: 3,
              succeeded: 2,
              failed: 1,
              results: [
                {
                  accountId: '123e4567-e89b-12d3-a456-426614174000',
                  status: 'success',
                  error: null,
                },
                {
                  accountId: '123e4567-e89b-12d3-a456-426614174001',
                  status: 'success',
                  error: null,
                },
                {
                  accountId: '123e4567-e89b-12d3-a456-426614174002',
                  status: 'failed',
                  error: 'Account not found',
                },
              ],
            },
          },
        },
      },
    },
  }, controller.syncAll.bind(controller));
}

