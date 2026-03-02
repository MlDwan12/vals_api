import { Module } from '@nestjs/common';
import { ServiceStep } from './entities/service_step.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceStepsService } from './service_steps.service';
import { ServiceStepsRepository } from './service_steps.repository';
import { ServiceStepsController } from './service_steps.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceStep])],
  controllers: [ServiceStepsController],
  providers: [ServiceStepsService, ServiceStepsRepository],
  exports: [ServiceStepsService],
})
export class ServiceStepsModule {}
