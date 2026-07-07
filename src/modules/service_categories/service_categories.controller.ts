import { Controller, Get } from '@nestjs/common';
import { ServiceCategoriesService } from './service_categories.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Категории услуг')
@Controller('service-categories')
export class ServiceCategoriesController {
  constructor(private readonly service: ServiceCategoriesService) {}

  @Get()
  async getListCategory() {
    return this.service.findAll();
  }
}
