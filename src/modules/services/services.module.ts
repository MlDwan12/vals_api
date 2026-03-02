import { Module } from '@nestjs/common';
import { Service } from './entities/service.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { ServiceRepository } from './service.repository';
import { ServiceCategoriesModule } from '../service_categories/service_categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Service]), ServiceCategoriesModule],
  controllers: [ServicesController],
  providers: [ServicesService, ServiceRepository],
  exports: [ServicesService, ServiceRepository],
})
export class ServicesModule {}
