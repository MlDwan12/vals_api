import { Module } from '@nestjs/common';
import { Service } from './entities/service.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { ServiceRepository } from './service.repository';
import { ServiceCategoriesModule } from '../service_categories/service_categories.module';
import { ServiceSearchReindexService } from './services-search-reindex.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service]),
    ServiceCategoriesModule,
    SearchModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService, ServiceRepository, ServiceSearchReindexService],
  exports: [ServicesService, ServiceRepository],
})
export class ServicesModule {}
