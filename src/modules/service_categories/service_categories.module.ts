import { Module } from '@nestjs/common';
import { ServiceCategory } from './entities/service_category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceCategoriesService } from './service_categories.service';
import { ServiceCategoryRepository } from './service_categories.repository';
import { ServiceCategoriesController } from './service_categories.controller';
import { ServiceCategoriesAdminController } from './service_categories-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceCategory])],
  controllers: [ServiceCategoriesController, ServiceCategoriesAdminController],
  providers: [ServiceCategoriesService, ServiceCategoryRepository],
  exports: [ServiceCategoriesService, ServiceCategoryRepository],
})
export class ServiceCategoriesModule {}
