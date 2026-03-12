import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { ClientLeadEntity } from '../entities/client-lead.entity';
import { PaginationResult } from 'src/core/crud/interfaces/pagination.interface';
import { ClientLeadQueryDto } from '../dto/client-lead-query.dto';

@Injectable()
export class ClientLeadAdminService {
  constructor(
    @InjectRepository(ClientLeadEntity)
    private readonly leadRepository: Repository<ClientLeadEntity>,
  ) {}

  async findById(id: number): Promise<ClientLeadEntity> {
    const lead = await this.leadRepository.findOne({
      where: { id },
    });

    if (!lead) {
      throw new NotFoundException(`ClientLead with ID ${id} not found`);
    }

    return lead;
  }

  async paginate(
    query: ClientLeadQueryDto,
  ): Promise<PaginationResult<ClientLeadEntity>> {
    const where: FindOptionsWhere<ClientLeadEntity> = {};

    if (query.clientId !== undefined) {
      where.clientId = query.clientId;
    }

    if (query.type !== undefined) {
      where.type = query.type;
    }

    const options: FindManyOptions<ClientLeadEntity> = {
      where,
      order: {
        createdAt: 'DESC',
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    };

    const [data, total] = await this.leadRepository.findAndCount(options);

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async findByClientId(
    clientId: number,
    page: number,
    limit: number,
  ): Promise<PaginationResult<ClientLeadEntity>> {
    const [data, total] = await this.leadRepository.findAndCount({
      where: { clientId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
