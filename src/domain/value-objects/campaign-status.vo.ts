export enum CampaignStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  DELETED = 'DELETED',
  ARCHIVED = 'ARCHIVED',
}

export class CampaignStatusVO {
  constructor(private readonly status: string) {
    if (!Object.values(CampaignStatus).includes(status as CampaignStatus)) {
      throw new Error(`Invalid campaign status: ${status}`);
    }
  }

  getValue(): string {
    return this.status;
  }

  isActive(): boolean {
    return this.status === CampaignStatus.ACTIVE;
  }
}

