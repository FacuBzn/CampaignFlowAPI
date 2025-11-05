import Fastify from 'fastify';
import { registerRoutes } from './app';
import { prisma } from './infrastructure/database/prisma/prismaClient';

const server = Fastify({ logger: true });

let isShuttingDown = false;

const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) {
    server.log.warn(`Received ${signal} again, forcing exit...`);
    process.exit(1);
  }

  isShuttingDown = true;
  server.log.info(`Received ${signal}, starting graceful shutdown...`);

  const shutdownTimeout = setTimeout(() => {
    server.log.error('Graceful shutdown timeout, forcing exit...');
    process.exit(1);
  }, 10000); // 10 seconds timeout

  try {
    // Close Fastify server
    await server.close();
    server.log.info('Fastify server closed');

    // Close Prisma connection
    await prisma.$disconnect();
    server.log.info('Prisma connection closed');

    clearTimeout(shutdownTimeout);
    server.log.info('Graceful shutdown completed');
    process.exit(0);
  } catch (err) {
    server.log.error({ err }, 'Error during graceful shutdown');
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
};

const start = async () => {
  try {
    await prisma.$connect();
    await registerRoutes(server);
    const port = Number(process.env.PORT) || 3000;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server running on http://localhost:${port}`);

    // Register shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      server.log.error({ err: reason, promise }, 'Unhandled Rejection');
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      server.log.error({ err: error }, 'Uncaught Exception');
      gracefulShutdown('uncaughtException');
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

