import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

export async function registerRequestIdMiddleware(server: FastifyInstance) {
  // Agregar request ID a cada request
  server.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const requestId = request.headers['x-request-id'] as string || randomUUID();
    
    // Agregar a request object
    request.requestId = requestId;
    
    // Agregar a reply headers
    reply.header('X-Request-ID', requestId);
    
    // Agregar a logger context
    request.log = request.log.child({ requestId });
  });
}

// Extender tipos de Fastify
declare module 'fastify' {
  interface FastifyRequest {
    requestId: string;
  }
}

