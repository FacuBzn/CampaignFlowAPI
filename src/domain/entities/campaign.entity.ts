import { CampaignStatus } from '@prisma/client';

export class Campaign {
  constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _status: CampaignStatus,
    private readonly _spend: number,
    private readonly _budget: number,
    private readonly _accountId: string,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date
  ) {}

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get status(): CampaignStatus {
    return this._status;
  }

  get spend(): number {
    return this._spend;
  }

  get budget(): number {
    return this._budget;
  }

  get accountId(): string {
    return this._accountId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}

