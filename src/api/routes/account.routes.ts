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
          example: {
            data: [
              {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'My Account',
                createdAt: '2024-01-15T10:30:00.000Z',
                updatedAt: '2024-01-15T10:30:00.000Z',
              },
              {
                id: '123e4567-e89b-12d3-a456-426614174001',
                name: 'Another Account',
                createdAt: '2024-01-16T14:20:00.000Z',
                updatedAt: '2024-01-16T14:20:00.000Z',
              },
            ],
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
          example: {
            data: {
              id: '123e4567-e89b-12d3-a456-426614174000',
              name: 'My New Account',
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z',
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
          example: {
            data: [
              {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Synced Account 1',
              },
              {
                id: '123e4567-e89b-12d3-a456-426614174001',
                name: 'Synced Account 2',
              },
            ],
          },
        },
      },
    },
  }, controller.sync.bind(controller));
}

