import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ServiceRepository extends BaseCrudRepository<Service> {
  constructor(
    @InjectRepository(Service)
    repo: Repository<Service>,
  ) {
    super(repo, Service);
  }

  async findBatchAfterId(lastId: number, limit: number): Promise<Service[]> {
    const rawIds = await this.repo
      .createQueryBuilder('service')
      .select('service.id', 'id')
      .where('service.id > :lastId', { lastId })
      .orderBy('service.id', 'ASC')
      .limit(limit)
      .getRawMany<{ id: number }>();

    const ids = rawIds.map((item) => item.id);

    if (ids.length === 0) {
      return [];
    }

    return this.repo
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.category', 'category')
      .leftJoinAndSelect('service.stages', 'stage')
      .leftJoinAndSelect('service.tariffs', 'tariff')
      .leftJoinAndSelect('service.faq', 'faq')
      .where('service.id IN (:...ids)', { ids })
      .orderBy('service.id', 'ASC')
      .getMany();
  }
}
