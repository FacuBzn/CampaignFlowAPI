import { ICampaignRepository, CampaignMetrics } from '../../domain/repositories/campaign.repository';
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
      typeof created.spend === 'object' && 'toNumber' in created.spend
        ? created.spend.toNumber()
        : Number(created.spend),
      typeof created.budget === 'object' && 'toNumber' in created.budget
        ? created.budget.toNumber()
        : Number(created.budget),
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
      (camp) =>
        new Campaign(
          camp.id,
          camp.name,
          camp.status,
          typeof camp.spend === 'object' && 'toNumber' in camp.spend
            ? camp.spend.toNumber()
            : Number(camp.spend),
          typeof camp.budget === 'object' && 'toNumber' in camp.budget
            ? camp.budget.toNumber()
            : Number(camp.budget),
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
      typeof campaign.spend === 'object' && 'toNumber' in campaign.spend
        ? campaign.spend.toNumber()
        : Number(campaign.spend),
      typeof campaign.budget === 'object' && 'toNumber' in campaign.budget
        ? campaign.budget.toNumber()
        : Number(campaign.budget),
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
      (camp) =>
        new Campaign(
          camp.id,
          camp.name,
          camp.status,
          typeof camp.spend === 'object' && 'toNumber' in camp.spend
            ? camp.spend.toNumber()
            : Number(camp.spend),
          typeof camp.budget === 'object' && 'toNumber' in camp.budget
            ? camp.budget.toNumber()
            : Number(camp.budget),
          camp.accountId,
          camp.createdAt,
          camp.updatedAt
        )
    );
  }

  async update(id: string, campaign: {
    name?: string;
    status?: import('@prisma/client').CampaignStatus;
    spend?: number;
    budget?: number;
  }): Promise<Campaign> {
    // Validar que existe
    const existing = await prisma.campaign.findUnique({ where: { id } });
    if (!existing) {
      const { CampaignNotFoundError } = await import('../../domain/errors/campaign-not-found.error');
      throw new CampaignNotFoundError(id);
    }

    // Validar datos
    if (campaign.name && campaign.name.length > 255) {
      const { ValidationError } = await import('../../domain/errors/validation.error');
      throw new ValidationError('Name cannot exceed 255 characters');
    }
    if (campaign.spend !== undefined && (campaign.spend < 0 || campaign.spend > 999999999.99)) {
      const { ValidationError } = await import('../../domain/errors/validation.error');
      throw new ValidationError('Spend must be between 0 and 999999999.99');
    }
    if (campaign.budget !== undefined && (campaign.budget < 0 || campaign.budget > 999999999.99)) {
      const { ValidationError } = await import('../../domain/errors/validation.error');
      throw new ValidationError('Budget must be between 0 and 999999999.99');
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        ...(campaign.name && { name: campaign.name.trim() }),
        ...(campaign.status && { status: campaign.status }),
        ...(campaign.spend !== undefined && { spend: campaign.spend }),
        ...(campaign.budget !== undefined && { budget: campaign.budget }),
      },
    });

    return new Campaign(
      updated.id,
      updated.name,
      updated.status,
      typeof updated.spend === 'object' && 'toNumber' in updated.spend
        ? updated.spend.toNumber()
        : Number(updated.spend),
      typeof updated.budget === 'object' && 'toNumber' in updated.budget
        ? updated.budget.toNumber()
        : Number(updated.budget),
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
        typeof created.spend === 'object' && 'toNumber' in created.spend
          ? created.spend.toNumber()
          : Number(created.spend),
        typeof created.budget === 'object' && 'toNumber' in created.budget
          ? created.budget.toNumber()
          : Number(created.budget),
        created.accountId,
        created.createdAt,
        created.updatedAt
      );
    }

    // Use Prisma upsert when ID is provided
    const result = await prisma.campaign.upsert({
      where: { id: campaign.id },
      update: {
        name: campaign.name,
        status: campaign.status,
        spend: campaign.spend,
        budget: campaign.budget,
      },
      create: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        spend: campaign.spend,
        budget: campaign.budget,
        accountId: campaign.accountId,
      },
    });

    return new Campaign(
      result.id,
      result.name,
      result.status,
      typeof result.spend === 'object' && 'toNumber' in result.spend
        ? result.spend.toNumber()
        : Number(result.spend),
      typeof result.budget === 'object' && 'toNumber' in result.budget
        ? result.budget.toNumber()
        : Number(result.budget),
      result.accountId,
      result.createdAt,
      result.updatedAt
    );
  }

  async upsertMany(campaigns: Array<{
    id: string;
    name: string;
    status: string;
    spend: number;
    budget: number;
    accountId: string;
  }>): Promise<Campaign[]> {
    // Usar transacción para batch upsert
    const results = await prisma.$transaction(
      campaigns.map(campaign =>
        prisma.campaign.upsert({
          where: { id: campaign.id },
          update: {
            name: campaign.name,
            status: campaign.status,
            spend: campaign.spend,
            budget: campaign.budget,
          },
          create: {
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            spend: campaign.spend,
            budget: campaign.budget,
            accountId: campaign.accountId,
          },
        })
      ),
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );

    return results.map(result =>
      new Campaign(
        result.id,
        result.name,
        result.status,
        typeof result.spend === 'object' && 'toNumber' in result.spend
          ? result.spend.toNumber()
          : Number(result.spend),
        typeof result.budget === 'object' && 'toNumber' in result.budget
          ? result.budget.toNumber()
          : Number(result.budget),
        result.accountId,
        result.createdAt,
        result.updatedAt
      )
    );
  }

  async getMetricsForAccount(accountId: string): Promise<CampaignMetrics> {
    const result = await prisma.campaign.aggregate({
      where: { accountId },
      _count: { id: true },
      _sum: {
        spend: true,
        budget: true,
      },
    });

    return {
      accountId,
      totalCampaigns: result._count.id,
      totalSpend:
        result._sum.spend && typeof result._sum.spend === 'object' && 'toNumber' in result._sum.spend
          ? result._sum.spend.toNumber()
          : Number(result._sum.spend || 0),
      totalBudget:
        result._sum.budget && typeof result._sum.budget === 'object' && 'toNumber' in result._sum.budget
          ? result._sum.budget.toNumber()
          : Number(result._sum.budget || 0),
    };
  }
}

