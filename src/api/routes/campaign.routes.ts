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
        properties: {
          id: { type: 'string' },
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
        properties: {
          id: { type: 'string' },
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
        },
      },
    },
  }, controller.syncAll.bind(controller));
}

