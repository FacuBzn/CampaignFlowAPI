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
            database: {
              type: 'object',
              properties: {
                status: { type: 'string' },
              },
            },
          },
          example: {
            status: 'ok',
            timestamp: '2024-01-15T10:30:00.000Z',
            database: {
              status: 'connected',
            },
          },
        },
        503: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            database: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                error: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { prisma } = await import('./infrastructure/database/prisma/prismaClient');
    
    let dbStatus = 'connected';
    let dbError: string | undefined;

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      dbStatus = 'disconnected';
      dbError = error instanceof Error ? error.message : 'Unknown error';
      request.log.error('Database health check failed:', error);
    }

    const healthStatus = {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        ...(dbError && { error: dbError }),
      },
    };

    if (dbStatus === 'disconnected') {
      return reply.status(503).send(healthStatus);
    }

    return reply.send(healthStatus);
  });

  // Register API routes
  await server.register(accountRoutes);
  await server.register(campaignRoutes);
}

