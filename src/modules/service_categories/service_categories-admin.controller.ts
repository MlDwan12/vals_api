import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ServiceCategoriesService } from './service_categories.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ServiceCategory } from './entities/service_category.entity';
import { CreateServiceCategoryDto } from './dto/create-service_category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service_category.dto';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CONTENT_ROLES } from 'src/common/constants/roles.constant';
import type { PaginationResult } from 'src/core/crud/interfaces/pagination.interface';

@ApiTags('Категории услуг (админ)')
@Controller('admin/service-categories')
export class ServiceCategoriesAdminController extends BaseCrudController<
  ServiceCategory,
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto
> {
  protected entityName: string;

  constructor(protected readonly service: ServiceCategoriesService) {
    super(service);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  async paginate(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<PaginationResult<ServiceCategory>> {
    return this.service.paginate({}, { page: +page, limit: +limit });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  async findById(@Param('id', ParseIntPipe) id: number): Promise<ServiceCategory> {
    return this.service.findById(id);
  }
}
