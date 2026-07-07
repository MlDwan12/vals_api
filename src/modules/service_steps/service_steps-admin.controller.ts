import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { CreateServiceStepDto } from './dto/create-service_step.dto';
import { UpdateServiceStepDto } from './dto/update-service_step.dto';
import { ServiceStep } from './entities/service_step.entity';
import { ServiceStepsService } from './service_steps.service';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CONTENT_ROLES } from 'src/common/constants/roles.constant';
import type { PaginationResult } from 'src/core/crud/interfaces/pagination.interface';

@ApiTags('Этапы услуг (админ)')
@Controller('admin/service-steps')
export class ServiceStepsAdminController extends BaseCrudController<
  ServiceStep,
  CreateServiceStepDto,
  UpdateServiceStepDto
> {
  protected entityName: string;

  constructor(protected readonly service: ServiceStepsService) {
    super(service);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  async paginate(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<PaginationResult<ServiceStep>> {
    return this.service.paginate({}, { page: +page, limit: +limit });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  async findById(@Param('id', ParseIntPipe) id: number): Promise<ServiceStep> {
    return this.service.findById(id);
  }
}
