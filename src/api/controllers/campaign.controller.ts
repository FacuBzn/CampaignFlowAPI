import { FastifyRequest, FastifyReply } from 'fastify';
import { SyncCampaignsUseCase } from '../../application/use-cases/campaign/syncCampaigns.usecase';
import { GetCampaignMetricsUseCase } from '../../application/use-cases/campaign/getCampaignMetrics.usecase';
import { SyncAllCampaignsUseCase } from '../../application/use-cases/campaign/syncAllCampaigns.usecase';
import { DIContainer } from '../../infrastructure/di/container';

export class CampaignController {
  private syncCampaignsUseCase: SyncCampaignsUseCase;
  private getCampaignMetricsUseCase: GetCampaignMetricsUseCase;
  private syncAllCampaignsUseCase: SyncAllCampaignsUseCase;

  constructor(
    syncCampaignsUseCase?: SyncCampaignsUseCase,
    getCampaignMetricsUseCase?: GetCampaignMetricsUseCase,
    syncAllCampaignsUseCase?: SyncAllCampaignsUseCase
  ) {
    this.syncCampaignsUseCase = syncCampaignsUseCase || DIContainer.getSyncCampaignsUseCase();
    this.getCampaignMetricsUseCase = getCampaignMetricsUseCase || DIContainer.getGetCampaignMetricsUseCase();
    this.syncAllCampaignsUseCase = syncAllCampaignsUseCase || DIContainer.getSyncAllCampaignsUseCase();
  }

  async syncCampaigns(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const result = await this.syncCampaignsUseCase.execute(id);
      return reply.send({ data: { synced: result.length, accountId: id } });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to sync campaigns' });
    }
  }

  async getMetrics(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const metrics = await this.getCampaignMetricsUseCase.execute(id);
      return reply.send({ data: metrics });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to get metrics' });
    }
  }

  async syncAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await this.syncAllCampaignsUseCase.execute();
      return reply.send({ data: result });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to sync all campaigns' });
    }
  }
}

