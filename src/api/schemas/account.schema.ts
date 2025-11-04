import { z } from 'zod';

export const createAccountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export const accountResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type AccountResponse = z.infer<typeof accountResponseSchema>;

