import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { ServiceCategory } from './entities/service_category.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ServiceCategoryRepository extends BaseCrudRepository<ServiceCategory> {
  constructor(
    @InjectRepository(ServiceCategory)
    repo: Repository<ServiceCategory>,
  ) {
    super(repo, ServiceCategory);
  }
}
