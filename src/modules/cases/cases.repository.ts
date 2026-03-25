import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { Case } from './entities/case.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CaseRepository extends BaseCrudRepository<Case> {
  constructor(
    @InjectRepository(Case)
    repo: Repository<Case>,
  ) {
    super(repo, Case);
  }

  async findBatchAfterId(lastId: number, limit: number): Promise<Case[]> {
    const rawIds = await this.repo
      .createQueryBuilder('case')
      .select('case.id', 'id')
      .where('case.id > :lastId', { lastId })
      .orderBy('case.id', 'ASC')
      .limit(limit)
      .getRawMany<{ id: number }>();

    const ids = rawIds.map((item) => item.id);

    if (ids.length === 0) {
      return [];
    }

    return this.repo
      .createQueryBuilder('case')
      .leftJoinAndSelect('case.services', 'service')
      .where('case.id IN (:...ids)', { ids })
      .orderBy('case.id', 'ASC')
      .getMany();
  }
}
