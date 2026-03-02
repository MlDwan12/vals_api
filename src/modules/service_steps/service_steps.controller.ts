import { Controller } from '@nestjs/common';
import { CreateServiceStepDto } from './dto/create-service_step.dto';
import { UpdateServiceStepDto } from './dto/update-service_step.dto';
import { ServiceStep } from './entities/service_step.entity';
import { ServiceStepsService } from './service_steps.service';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Этапы услуг')
@Controller('service-steps')
export class ServiceStepsController extends BaseCrudController<
  ServiceStep,
  CreateServiceStepDto,
  UpdateServiceStepDto
> {
  protected entityName: string;

  constructor(protected readonly service: ServiceStepsService) {
    super(service);
  }
}
