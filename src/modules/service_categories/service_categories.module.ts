import { Module } from '@nestjs/common';
import { ServiceCategory } from './entities/service_category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceCategoriesService } from './service_categories.service';
import { ServiceCategoryRepository } from './service_categories.repository';
import { ServiceCategoriesController } from './service_categories.controller';

// const ServiceCategoryCrudModule = CrudModule<ServiceCategory>({
//   entity: ServiceCategory,
//   dto: { create: CreateServiceCategoryDto, update: UpdateServiceCategoryDto },
//   path: 'service_categories',
//   tags: ['Категории услуг'],
// });

@Module({
  imports: [TypeOrmModule.forFeature([ServiceCategory])],
  controllers: [ServiceCategoriesController],
  providers: [ServiceCategoriesService, ServiceCategoryRepository],
  exports: [ServiceCategoriesService, ServiceCategoryRepository],
})
export class ServiceCategoriesModule {}
