import { FastifyInstance } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

export async function setupSwagger(server: FastifyInstance) {
  await server.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'CampaignFlowAPI',
        description: 'Clean architecture backend built with Fastify, TypeScript, and Prisma. Synchronizes Meta Ads mock accounts, campaigns, and metrics with PostgreSQL.',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
    },
  });

  await server.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  // Global error handler
  server.setErrorHandler((error: any, _request: any, reply: any) => {
    server.log.error(error);
    reply.status(error.statusCode || 500).send({
      error: {
        message: error.message || 'Internal Server Error',
        statusCode: error.statusCode || 500,
      },
    });
  });
}

