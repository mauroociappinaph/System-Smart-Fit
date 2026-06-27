import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AgentInsightRepository,
  FindByUserIdOptions,
  DateFilter,
} from '../../../application/ports/out/agent-insight.repository';
import {
  AgentInsight,
  ValidationStatus,
} from '../../../domain/entities/agent-insight.entity';

@Injectable()
export class AgentInsightPrismaRepository implements AgentInsightRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(insight: AgentInsight): Promise<void> {
    await this.prisma.agentInsight.upsert({
      where: { id: insight.id },
      create: {
        id: insight.id,
        userId: insight.userId,
        correlationId: insight.correlationId,
        category: insight.category,
        content: insight.content,
        score: insight.score,
        validationStatus: insight.validationStatus,
        createdAt: insight.createdAt,
        updatedAt: insight.updatedAt,
      },
      update: {
        validationStatus: insight.validationStatus,
        updatedAt: insight.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<AgentInsight | null> {
    const record = await this.prisma.agentInsight.findUnique({ where: { id } });
    if (!record) return null;

    return this.toDomain(record);
  }

  async findByUserId(
    userId: string,
    options?: FindByUserIdOptions,
  ): Promise<AgentInsight[]> {
    const records = await this.prisma.agentInsight.findMany({
      where: { userId, ...this.buildDateWhere(options?.dateFilter) },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });

    return records.map((r) => this.toDomain(r));
  }

  async countByUserId(
    userId: string,
    dateFilter?: DateFilter,
  ): Promise<number> {
    return this.prisma.agentInsight.count({
      where: { userId, ...this.buildDateWhere(dateFilter) },
    });
  }

  private buildDateWhere(dateFilter?: DateFilter): {
    createdAt?: { gte?: number; lte?: number };
  } {
    if (!dateFilter) return {};
    const where: { createdAt?: { gte?: number; lte?: number } } = {};
    if (dateFilter.startDate !== undefined) {
      where.createdAt = { ...where.createdAt, gte: dateFilter.startDate };
    }
    if (dateFilter.endDate !== undefined) {
      where.createdAt = { ...where.createdAt, lte: dateFilter.endDate };
    }
    return where;
  }

  private toDomain(record: {
    id: string;
    userId: string;
    correlationId: string;
    category: string;
    content: string;
    score: number;
    validationStatus: string;
    createdAt: bigint;
    updatedAt: bigint;
  }): AgentInsight {
    return AgentInsight.reconstitute(
      record.id,
      record.userId,
      record.correlationId,
      record.category,
      record.content,
      record.score,
      record.validationStatus as ValidationStatus,
      Number(record.createdAt),
      Number(record.updatedAt),
    );
  }
}
