import { z } from 'zod';

export const createAccountSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name cannot exceed 255 characters')
    .trim(),
});

export const updateAccountSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name cannot exceed 255 characters')
    .trim()
    .optional(),
});

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const orderBySchema = z.enum(['createdAt', 'updatedAt', 'name']).default('createdAt');
export const orderDirectionSchema = z.enum(['asc', 'desc']).default('desc');

export const sortQuerySchema = z.object({
  orderBy: orderBySchema,
  orderDirection: orderDirectionSchema,
});

export const accountResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type AccountResponse = z.infer<typeof accountResponseSchema>;

