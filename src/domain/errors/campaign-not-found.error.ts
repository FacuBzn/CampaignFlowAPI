import { AppError } from './base.error';

export class CampaignNotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = 'CAMPAIGN_NOT_FOUND';

  constructor(campaignId: string) {
    super(`Campaign with id ${campaignId} not found`, { campaignId });
  }
}

