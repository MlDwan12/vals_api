import { Module } from '@nestjs/common';
import { TariffPeriod } from './entities/tariff_period.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TariffPeriodsService } from './tariff_periods.service';
import { TariffPeriodRepository } from './tariff_periods.repository';
import { TariffPeriodsController } from './tariff_periods.controller';
import { TariffPeriodsAdminController } from './tariff_periods-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TariffPeriod])],
  controllers: [TariffPeriodsController, TariffPeriodsAdminController],
  providers: [TariffPeriodsService, TariffPeriodRepository],
  exports: [TariffPeriodsService],
})
export class TariffPeriodsModule {}
