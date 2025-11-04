import { z } from 'zod';

export const campaignResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.string(),
  spend: z.number(),
  budget: z.number(),
  accountId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const campaignMetricsSchema = z.object({
  accountId: z.string().uuid(),
  totalCampaigns: z.number(),
  totalSpend: z.number(),
  totalBudget: z.number(),
});

export type CampaignResponse = z.infer<typeof campaignResponseSchema>;
export type CampaignMetrics = z.infer<typeof campaignMetricsSchema>;

