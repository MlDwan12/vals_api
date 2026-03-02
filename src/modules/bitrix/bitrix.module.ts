import { Module } from '@nestjs/common';
import { BitrixService } from './bitrix.service';
import { BitrixController } from './bitrix.controller';
import { ConfigModule } from '@nestjs/config';
import { TariffsModule } from '../tariffs/tariffs.module';
import { TariffPeriodsModule } from '../tariff_periods/tariff_periods.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [ConfigModule, TariffsModule, TariffPeriodsModule, ServicesModule],
  controllers: [BitrixController],
  providers: [BitrixService],
  exports: [BitrixService],
})
export class BitrixModule {}
