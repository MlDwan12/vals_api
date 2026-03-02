import { Module } from '@nestjs/common';
import { Tariff } from './entities/tariff.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesModule } from '../services/services.module';
import { TariffsController } from './tariffs.controller';
import { TariffsService } from './tariffs.service';
import { TariffsRepository } from './tariffs.repository';
import { TariffPeriodsModule } from '../tariff_periods/tariff_periods.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tariff]),
    ServicesModule,
    TariffPeriodsModule,
  ],
  controllers: [TariffsController],
  providers: [TariffsService, TariffsRepository],
  exports: [TariffsService],
})
export class TariffsModule {}
