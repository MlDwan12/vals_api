import { Injectable } from '@nestjs/common';
import { CreateServiceStepDto } from './dto/create-service_step.dto';
import { UpdateServiceStepDto } from './dto/update-service_step.dto';
import { ServiceStep } from './entities/service_step.entity';
import { ServiceStepsRepository } from './service_steps.repository';
import { PinoLogger } from 'nestjs-pino';
import { BaseCrudService } from 'src/core/crud/base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudRepository } from 'src/core/crud/base.repository';

@Injectable()
export class ServiceStepsService extends BaseCrudService<
  ServiceStep,
  CreateServiceStepDto,
  UpdateServiceStepDto
> {
  protected repository: BaseCrudRepository<ServiceStep>;
  constructor(
    @InjectRepository(ServiceStep)
    private readonly repo: Repository<ServiceStep>,
    protected readonly logger: PinoLogger,
  ) {
    super(logger);
    this.repository = new ServiceStepsRepository(this.repo);
  }
}
