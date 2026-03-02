import { Injectable } from '@nestjs/common';
import { ServiceCategory } from './entities/service_category.entity';
import { UpdateServiceCategoryDto } from './dto/update-service_category.dto';
import { ServiceCategoryRepository } from './service_categories.repository';
import { PinoLogger } from 'nestjs-pino';
import { BaseCrudService } from 'src/core/crud/base.service';
import { CreateServiceCategoryDto } from './dto/create-service_category.dto';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ServiceCategoriesService extends BaseCrudService<
  ServiceCategory,
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto
> {
  protected readonly repository: BaseCrudRepository<ServiceCategory>;

  constructor(
    @InjectRepository(ServiceCategory)
    private readonly repo: Repository<ServiceCategory>,

    protected readonly logger: PinoLogger,
  ) {
    super(logger);
    this.repository = new ServiceCategoryRepository(this.repo);
  }
}
