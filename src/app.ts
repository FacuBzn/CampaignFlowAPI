import { FastifyInstance } from 'fastify';
import { setupSwagger } from './infrastructure/config/fastify';
import { accountRoutes } from './api/routes/account.routes';
import { campaignRoutes } from './api/routes/campaign.routes';

export async function registerRoutes(server: FastifyInstance) {
  // Setup Swagger documentation
  await setupSwagger(server);

  // Health check endpoint
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register API routes
  await server.register(accountRoutes);
  await server.register(campaignRoutes);
}

