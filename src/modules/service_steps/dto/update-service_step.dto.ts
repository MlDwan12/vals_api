import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceStepDto } from './create-service_step.dto';

export class UpdateServiceStepDto extends PartialType(CreateServiceStepDto) {}
