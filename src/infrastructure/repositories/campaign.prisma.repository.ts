import { ICampaignRepository } from '../../domain/repositories/campaign.repository';
import { Campaign } from '../../domain/entities/campaign.entity';
import { prisma } from '../database/prisma/prismaClient';

export class CampaignPrismaRepository implements ICampaignRepository {
  async create(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
    const created = await prisma.campaign.create({
      data: {
        name: campaign.name,
        status: campaign.status,
        spend: campaign.spend,
        budget: campaign.budget,
        accountId: campaign.accountId,
      },
    });

    return new Campaign(
      created.id,
      created.name,
      created.status,
      created.spend,
      created.budget,
      created.accountId,
      created.createdAt,
      created.updatedAt
    );
  }

  async findAll(): Promise<Campaign[]> {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map(
      (camp: any) =>
        new Campaign(
          camp.id,
          camp.name,
          camp.status,
          camp.spend,
          camp.budget,
          camp.accountId,
          camp.createdAt,
          camp.updatedAt
        )
    );
  }

  async findById(id: string): Promise<Campaign | null> {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) return null;

    return new Campaign(
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.spend,
      campaign.budget,
      campaign.accountId,
      campaign.createdAt,
      campaign.updatedAt
    );
  }

  async findByAccountId(accountId: string): Promise<Campaign[]> {
    const campaigns = await prisma.campaign.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map(
      (camp: any) =>
        new Campaign(
          camp.id,
          camp.name,
          camp.status,
          camp.spend,
          camp.budget,
          camp.accountId,
          camp.createdAt,
          camp.updatedAt
        )
    );
  }

  async update(id: string, campaign: Partial<Campaign>): Promise<Campaign> {
    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        name: campaign.name,
        status: campaign.status,
        spend: campaign.spend,
        budget: campaign.budget,
      },
    });

    return new Campaign(
      updated.id,
      updated.name,
      updated.status,
      updated.spend,
      updated.budget,
      updated.accountId,
      updated.createdAt,
      updated.updatedAt
    );
  }

  async delete(id: string): Promise<void> {
    await prisma.campaign.delete({
      where: { id },
    });
  }

  async upsert(campaign: {
    id?: string;
    name: string;
    status: string;
    spend: number;
    budget: number;
    accountId: string;
  }): Promise<Campaign> {
    if (!campaign.id) {
      // If no ID provided, create new campaign
      const created = await prisma.campaign.create({
        data: {
          name: campaign.name,
          status: campaign.status,
          spend: campaign.spend,
          budget: campaign.budget,
          accountId: campaign.accountId,
        },
      });
      return new Campaign(
        created.id,
        created.name,
        created.status,
        created.spend,
        created.budget,
        created.accountId,
        created.createdAt,
        created.updatedAt
      );
    }

    // Try to find existing campaign
    const existing = await prisma.campaign.findUnique({
      where: { id: campaign.id },
    });

    if (existing) {
      // Update existing
      const updated = await prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          name: campaign.name,
          status: campaign.status,
          spend: campaign.spend,
          budget: campaign.budget,
        },
      });
      return new Campaign(
        updated.id,
        updated.name,
        updated.status,
        updated.spend,
        updated.budget,
        updated.accountId,
        updated.createdAt,
        updated.updatedAt
      );
    } else {
      // Create new with provided ID
      const created = await prisma.campaign.create({
        data: {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          spend: campaign.spend,
          budget: campaign.budget,
          accountId: campaign.accountId,
        },
      });
      return new Campaign(
        created.id,
        created.name,
        created.status,
        created.spend,
        created.budget,
        created.accountId,
        created.createdAt,
        created.updatedAt
      );
    }
  }
}

