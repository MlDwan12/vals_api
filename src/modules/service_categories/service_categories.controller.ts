import { Controller } from '@nestjs/common';
import { ServiceCategoriesService } from './service_categories.service';
import { ApiTags } from '@nestjs/swagger';
import { ServiceCategory } from './entities/service_category.entity';
import { CreateServiceCategoryDto } from './dto/create-service_category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service_category.dto';
import { BaseCrudController } from 'src/core/crud/base.controller';

@ApiTags('Категории услуг')
@Controller('service-categories')
export class ServiceCategoriesController extends BaseCrudController<
  ServiceCategory,
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto
> {
  protected entityName: string;

  constructor(protected readonly service: ServiceCategoriesService) {
    super(service);
  }
}
