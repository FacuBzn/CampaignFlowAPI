import { FastifyInstance } from 'fastify';
import { setupSwagger } from './infrastructure/config/fastify';
import { accountRoutes } from './api/routes/account.routes';
import { campaignRoutes } from './api/routes/campaign.routes';
import { prisma } from './infrastructure/database/prisma/prismaClient';
import { registerRequestIdMiddleware } from './infrastructure/middleware/request-id.middleware';

export async function registerRoutes(server: FastifyInstance) {
  // Registrar middleware de request ID primero
  await registerRequestIdMiddleware(server);

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
    let dbStatus = 'connected';
    let dbError: string | undefined;

    try {
      // Timeout para query de health check
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database health check timeout')), 5000)
        ),
      ]);
    } catch (error) {
      dbStatus = 'disconnected';
      dbError = error instanceof Error ? error.message : 'Unknown error';
      request.log.error({ err: error }, 'Database health check failed');
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

