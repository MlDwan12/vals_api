import { Module } from '@nestjs/common';
import { ServiceStep } from './entities/service_step.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceStepsService } from './service_steps.service';
import { ServiceStepsRepository } from './service_steps.repository';
import { ServiceStepsAdminController } from './service_steps-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceStep])],
  controllers: [ServiceStepsAdminController],
  providers: [ServiceStepsService, ServiceStepsRepository],
  exports: [ServiceStepsService],
})
export class ServiceStepsModule {}
