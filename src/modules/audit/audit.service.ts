import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

export interface CreateAuditLogData {
  userId?: number | null;
  username?: string | null;
  role?: string | null;
  action: string;
  method: string;
  path: string;
  resource?: string | null;
  resourceId?: number | null;
  statusCode: number;
  errorMessage?: string | null;
  ip?: string | null;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async log(data: CreateAuditLogData): Promise<void> {
    const entry = this.repo.create({
      userId: data.userId ?? null,
      username: data.username ?? null,
      role: data.role ?? null,
      action: data.action,
      method: data.method,
      path: data.path,
      resource: data.resource ?? null,
      resourceId: data.resourceId ?? null,
      statusCode: data.statusCode,
      errorMessage: data.errorMessage ?? null,
      ip: data.ip ?? null,
    });
    await this.repo.save(entry);
  }

  async findAll(query: QueryAuditLogDto) {
    const { page, limit, userId, username, action, resource, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('log')
      .orderBy('log.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (userId !== undefined) qb.andWhere('log.userId = :userId', { userId });
    if (username) qb.andWhere('log.username ILIKE :username', { username: `%${username}%` });
    if (action) qb.andWhere('log.action = :action', { action });
    if (resource) qb.andWhere('log.resource = :resource', { resource });
    if (dateFrom) qb.andWhere('log.createdAt >= :dateFrom', { dateFrom: new Date(dateFrom) });
    if (dateTo) qb.andWhere('log.createdAt <= :dateTo', { dateTo: new Date(dateTo) });

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
