import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { ServiceSearchReindexService } from './services-search-reindex.service';
import { ReindexResult } from '../search/interfaces/reindex-result.interface';
import { AdminListQueryDto } from 'src/shared/dto/admin-list-query.dto';
import { AdminPaginatedResponse } from 'src/core/crud/interfaces/pagination.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { DomainRestrictionGuard } from 'src/common/guards/domain-restriction.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ADMIN_ROLES,
  CONTENT_ROLES,
} from 'src/common/constants/roles.constant';
import type { PaginationResult } from 'src/core/crud/interfaces/pagination.interface';

@ApiTags('Услуги (админ)')
@Controller('admin/services')
export class ServicesAdminController extends BaseCrudController<
  Service,
  CreateServiceDto,
  UpdateServiceDto
> {
  protected entityName: string;

  constructor(
    protected readonly service: ServicesService,
    private readonly serviceSearchReindexService: ServiceSearchReindexService,
  ) {
    super(service);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Список всех услуг (с пагинацией)' })
  async paginate(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<PaginationResult<Service>> {
    return this.service.paginate({}, { page: +page, limit: +limit });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить услугу по ID' })
  @ApiOkResponse({ description: 'Услуга найдена' })
  @ApiNotFoundResponse({ description: 'Услуга не найдена' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Service> {
    return this.service.findById(id);
  }

  @Get('all/main-info')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getMainServiceInfoList(
    @Query() query: AdminListQueryDto,
  ): Promise<AdminPaginatedResponse<Service>> {
    return this.service.findListServiceMainInfo(query);
  }

  @Post('reindex')
  @UseGuards(JwtAuthGuard, RolesGuard, DomainRestrictionGuard)
  @Roles(...ADMIN_ROLES)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async reindex(): Promise<ReindexResult> {
    return this.serviceSearchReindexService.reindex();
  }
}
