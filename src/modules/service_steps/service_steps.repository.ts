import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { ServiceStep } from './entities/service_step.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ServiceStepsRepository extends BaseCrudRepository<ServiceStep> {
  constructor(
    @InjectRepository(ServiceStep)
    repo: Repository<ServiceStep>,
  ) {
    super(repo, ServiceStep);
  }
}
