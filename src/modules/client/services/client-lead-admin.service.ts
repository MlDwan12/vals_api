import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { ClientLeadEntity } from '../entities/client-lead.entity';
import { PaginationResult } from 'src/core/crud/interfaces/pagination.interface';
import { ClientLeadQueryDto } from '../dto/client-lead-query.dto';
import { ClientLeadMapper } from '../utils/client-lead.mapper';
import { ClientLeadListItemDto } from '../dto/client-lead-list-item.dto';

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

  async findByClientId(clientId: number): Promise<ClientLeadListItemDto[]> {
    const entities = await this.leadRepository.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
    });

    const data = ClientLeadMapper.toList(entities);

    return data;
  }
}

//  {
//                 "id": 2,
//                 "clientId": 1,
//                 "type": "TARIFF_REQUEST",
//                 "name": "TEst",
//                 "phoneRaw": "+7 991 234 56 78",
//                 "emailRaw": "alex@example.com",
//                 "message": null,
//                 "comment": "Интересует тариф на 6 месяцев",
//                 "utm": null,
//                  serviceName: "",
//                  tariffName: "",
//                  period: "",
//                    цена за месяц,
//                    цена за весь период
//                  "bitrixLeadId": "7727"
//                     "TITLE": "Выбрана услуга - ORM (Управление репутацией в сети)",
//                 "createdAt": "2026-03-11T07:16:37.551Z"
//             },
