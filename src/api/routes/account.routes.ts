import { FastifyInstance } from 'fastify';
import { AccountController } from '../controllers/account.controller';

export async function accountRoutes(server: FastifyInstance) {
  const controller = new AccountController();

  server.get('/accounts', {
    schema: {
      description: 'Get all accounts with pagination and sorting',
      tags: ['Accounts'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'number', minimum: 0, default: 0 },
          orderBy: { 
            type: 'string', 
            enum: ['createdAt', 'updatedAt', 'name'],
            default: 'createdAt'
          },
          orderDirection: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'desc',
          },
        },
      },
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
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                limit: { type: 'number' },
                offset: { type: 'number' },
                hasMore: { type: 'boolean' },
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
            ],
            pagination: {
              total: 10,
              limit: 20,
              offset: 0,
              hasMore: false,
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

