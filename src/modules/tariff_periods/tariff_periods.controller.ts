import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TariffPeriod } from './entities/tariff_period.entity';
import { UpdateTariffPeriodDto } from './dto/update-tariff_period.dto';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { TariffPeriodsService } from './tariff_periods.service';
import { CreateTariffPeriodDto } from './dto/create-tariff_period.dto';

@ApiTags('Периоды тарифов')
@Controller('tariff-periods')
export class TariffPeriodsController extends BaseCrudController<
  TariffPeriod,
  CreateTariffPeriodDto,
  UpdateTariffPeriodDto
> {
  protected entityName: string;

  constructor(protected readonly service: TariffPeriodsService) {
    super(service);
  }

  @Get()
  async getListPeriods() {
    try {
      return await this.service.findAll();
    } catch (e) {
      console.error('REAL ERROR:', e);
      throw e;
    }
  }
}
