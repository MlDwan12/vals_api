import { Module } from '@nestjs/common';
import { TariffPeriod } from './entities/tariff_period.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TariffPeriodsService } from './tariff_periods.service';
import { TariffPeriodRepository } from './tariff_periods.repository';
import { TariffPeriodsController } from './tariff_periods.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TariffPeriod])],
  controllers: [TariffPeriodsController],
  providers: [TariffPeriodsService, TariffPeriodRepository],
  exports: [TariffPeriodsService],
})
export class TariffPeriodsModule {}
