import { Injectable } from '@nestjs/common';
import { CreateTariffPeriodDto } from './dto/create-tariff_period.dto';
import { UpdateTariffPeriodDto } from './dto/update-tariff_period.dto';
import { PinoLogger } from 'nestjs-pino';
import { BaseCrudService } from 'src/core/crud/base.service';
import { TariffPeriod } from './entities/tariff_period.entity';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository.js';
import { TariffPeriodRepository } from './tariff_periods.repository';

@Injectable()
export class TariffPeriodsService extends BaseCrudService<
  TariffPeriod,
  CreateTariffPeriodDto,
  UpdateTariffPeriodDto
> {
  protected repository: BaseCrudRepository<TariffPeriod>;
  constructor(
    @InjectRepository(TariffPeriod)
    private readonly repo: Repository<TariffPeriod>,
    protected readonly logger: PinoLogger,
  ) {
    super(logger);
    this.repository = new TariffPeriodRepository(this.repo);
  }
}
