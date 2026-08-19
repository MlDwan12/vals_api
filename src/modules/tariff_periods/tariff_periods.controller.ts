import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TariffPeriodsService } from './tariff_periods.service';

@ApiTags('Периоды тарифов')
@Controller('tariff-periods')
export class TariffPeriodsController {
  constructor(private readonly service: TariffPeriodsService) {}

  @Get()
  async getListPeriods() {
    return this.service.findAll();
  }
}
