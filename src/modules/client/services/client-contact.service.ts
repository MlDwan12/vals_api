import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ClientContactEntity } from '../entities/client-contact.entity';
import { ClientContactQueryDto } from '../dto/client-contact-query.dto';
import { PaginationResult } from 'src/core/crud/interfaces/pagination.interface';

@Injectable()
export class ClientContactService {
  constructor(
    @InjectRepository(ClientContactEntity)
    private readonly contactRepository: Repository<ClientContactEntity>,
  ) {}

  async findById(id: number): Promise<ClientContactEntity> {
    const contact = await this.contactRepository.findOne({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException(`ClientContact with ID ${id} not found`);
    }

    return contact;
  }

  async paginate(
    query: ClientContactQueryDto,
  ): Promise<PaginationResult<ClientContactEntity>> {
    const where: FindOptionsWhere<ClientContactEntity> = {};

    if (query.clientId !== undefined) {
      where.clientId = query.clientId;
    }

    if (query.type !== undefined) {
      where.type = query.type;
    }

    const [data, total] = await this.contactRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async findByClientId(clientId: number): Promise<ClientContactEntity[]> {
    return this.contactRepository.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
    });
  }
}
