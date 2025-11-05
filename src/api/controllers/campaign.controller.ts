import { FastifyRequest, FastifyReply } from 'fastify';
import { SyncCampaignsUseCase } from '../../application/use-cases/campaign/syncCampaigns.usecase';
import { GetCampaignMetricsUseCase } from '../../application/use-cases/campaign/getCampaignMetrics.usecase';
import { SyncAllCampaignsUseCase } from '../../application/use-cases/campaign/syncAllCampaigns.usecase';
import { DIContainer } from '../../infrastructure/di/container';
import { AppError } from '../../domain/errors/base.error';

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
      return this.handleError(error, request, reply, 'Failed to sync campaigns');
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
      return this.handleError(error, request, reply, 'Failed to get metrics');
    }
  }

  async syncAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await this.syncAllCampaignsUseCase.execute();
      return reply.send({ data: result });
    } catch (error) {
      return this.handleError(error, request, reply, 'Failed to sync all campaigns');
    }
  }

  private handleError(
    error: unknown,
    request: FastifyRequest,
    reply: FastifyReply,
    defaultMessage: string
  ) {
    request.log.error({ err: error }, 'Controller error');

    // Si es AppError, usar su statusCode
    if (error instanceof AppError) {
      const errorResponse: {
        message: string;
        code: string;
        statusCode: number;
        details?: unknown;
      } = {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      };
      
      if (error.details) {
        errorResponse.details = error.details;
      }
      
      return reply.status(error.statusCode).send({
        error: errorResponse,
      });
    }

    // Error desconocido - 500
    return reply.status(500).send({
      error: {
        message: defaultMessage,
        statusCode: 500,
      },
    });
  }
}

