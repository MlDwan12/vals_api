import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { Tariff } from './entities/tariff.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TariffsRepository extends BaseCrudRepository<Tariff> {
  constructor(
    @InjectRepository(Tariff)
    repo: Repository<Tariff>,
  ) {
    super(repo, Tariff);
  }
}
