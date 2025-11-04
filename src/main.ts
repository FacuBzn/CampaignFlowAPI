import Fastify from 'fastify';
import { registerRoutes } from './app';
import { prisma } from './infrastructure/database/prisma/prismaClient';

const server = Fastify({ logger: true });

registerRoutes(server);

const start = async () => {
  try {
    await prisma.$connect();
    const port = Number(process.env.PORT) || 3000;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server running on http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

