import { FastifyInstance } from 'fastify';
import { setupSwagger } from './infrastructure/config/fastify';
import { accountRoutes } from './api/routes/account.routes';
import { campaignRoutes } from './api/routes/campaign.routes';

export async function registerRoutes(server: FastifyInstance) {
  // Setup Swagger documentation
  await setupSwagger(server);

  // Health check endpoint
  server.get('/health', {
    schema: {
      description: 'Health check endpoint',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
          },
          example: {
            status: 'ok',
            timestamp: '2024-01-15T10:30:00.000Z',
          },
        },
      },
    },
  }, async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register API routes
  await server.register(accountRoutes);
  await server.register(campaignRoutes);
}

