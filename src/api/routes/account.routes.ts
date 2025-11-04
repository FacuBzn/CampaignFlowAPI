import { FastifyInstance } from 'fastify';
import { AccountController } from '../controllers/account.controller';

export async function accountRoutes(server: FastifyInstance) {
  const controller = new AccountController();

  server.get('/accounts', {
    schema: {
      description: 'Get all accounts',
      tags: ['Accounts'],
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  }, controller.getAll.bind(controller));

  server.post('/accounts', {
    schema: {
      description: 'Create a new account',
      tags: ['Accounts'],
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, controller.create.bind(controller));

  server.post('/accounts/sync', {
    schema: {
      description: 'Sync accounts from external Meta Ads API',
      tags: ['Accounts'],
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  }, controller.sync.bind(controller));
}

