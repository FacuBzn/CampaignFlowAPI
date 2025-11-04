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
  interface FastifyValidationError {
    instancePath: string;
    schemaPath: string;
    keyword: string;
    params: Record<string, unknown>;
    message?: string;
  }

  server.setErrorHandler((error: Error & { statusCode?: number; validation?: FastifyValidationError[] }, request, reply) => {
    request.log.error(error);

    // Error de validación de Fastify
    if (error.validation) {
      return reply.status(400).send({
        error: {
          message: 'Validation error',
          details: error.validation,
          statusCode: 400,
        },
      });
    }

    // Error de negocio (4xx)
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      return reply.status(error.statusCode).send({
        error: {
          message: error.message || 'Bad Request',
          statusCode: error.statusCode,
        },
      });
    }

    // Error interno (5xx)
    const isDevelopment = process.env.NODE_ENV === 'development';
    return reply.status(error.statusCode || 500).send({
      error: {
        message: isDevelopment ? error.message : 'Internal Server Error',
        statusCode: error.statusCode || 500,
        ...(isDevelopment && { stack: error.stack }),
      },
    });
  });
}

