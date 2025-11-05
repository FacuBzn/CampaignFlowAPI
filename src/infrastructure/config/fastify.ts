import { FastifyInstance } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import rateLimit from '@fastify/rate-limit';

export async function setupSwagger(server: FastifyInstance) {
  // Register Swagger BEFORE rate limiting so Swagger routes are not rate-limited
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

  // Register rate limiting AFTER Swagger
  // Swagger routes are already registered and won't be affected by global rate limit
  await server.register(rateLimit, {
    global: true,
    max: 100, // Maximum number of requests
    timeWindow: '1 minute', // Time window for rate limit
    allowList: (request: { url: string }) => {
      // Allow Swagger UI and health check without rate limiting
      return request.url.startsWith('/docs') || request.url.startsWith('/health');
    },
    errorResponseBuilder: (_request, context) => {
      return {
        error: {
          message: 'Too many requests, please try again later',
          statusCode: 429,
          retryAfter: Math.round(context.ttl / 1000),
        },
      };
    },
  });

  // Register rate limiting for sync endpoints (more restrictive)
  await server.register(rateLimit, {
    max: 10,
    timeWindow: '1 minute',
    prefix: '/accounts/sync',
  });

  await server.register(rateLimit, {
    max: 5,
    timeWindow: '1 minute',
    prefix: '/sync/all',
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

