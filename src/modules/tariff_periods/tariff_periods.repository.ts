import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { TariffPeriod } from './entities/tariff_period.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TariffPeriodRepository extends BaseCrudRepository<TariffPeriod> {
  constructor(
    @InjectRepository(TariffPeriod)
    repo: Repository<TariffPeriod>,
  ) {
    super(repo, TariffPeriod);
  }
}
