import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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

@ApiTags('Услуги')
@Controller('services')
export class ServicesController extends BaseCrudController<
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

  // --- Публичные эндпоинты (сайт) ---

  @Get('all/info')
  async findAllWithRelations() {
    return this.service.findAllWithRelations();
  }

  @Get('all/short-info')
  async getShortServiceInfoList() {
    return this.service.findListServiceShortInfo();
  }

  @Get('all/full-info')
  async getFullServiceInfoList() {
    return this.service.findListServiceFullInfo();
  }

  @Get('list/faq')
  async getListServicesWithFaq() {
    return this.service.getListServicesWithFaq();
  }

  @Get('info/:slug')
  @ApiOperation({ summary: 'Получить услугу по slug (сайт)' })
  @ApiOkResponse({ description: 'Услуга найдена' })
  @ApiNotFoundResponse({ description: 'Услуга не найдена' })
  async getServiceInfo(@Param('slug') slug: string) {
    return this.service.findOneByIDWithRelations(slug);
  }

  // --- Админские эндпоинты ---

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
