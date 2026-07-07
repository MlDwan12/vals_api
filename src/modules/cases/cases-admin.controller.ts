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
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { Case } from './entities/case.entity';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { ReindexResult } from '../search/interfaces/reindex-result.interface';
import { CaseSearchReindexService } from './case-search-reindex.service';
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

@ApiTags('Кейсы (админ)')
@Controller('admin/cases')
export class CasesAdminController extends BaseCrudController<
  Case,
  CreateCaseDto,
  UpdateCaseDto
> {
  protected entityName: string;

  constructor(
    protected readonly service: CasesService,
    private readonly caseSearchReindexService: CaseSearchReindexService,
  ) {
    super(service);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Список всех кейсов (с пагинацией)' })
  async paginate(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<PaginationResult<Case>> {
    return this.service.paginate({}, { page: +page, limit: +limit });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить кейс по ID' })
  @ApiOkResponse({ description: 'Кейс найден' })
  @ApiNotFoundResponse({ description: 'Кейс не найден' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Case> {
    return this.service.findById(id);
  }

  @Get('all/main-info')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getMainCaseInfoList(
    @Query() query: AdminListQueryDto,
  ): Promise<AdminPaginatedResponse<Case>> {
    return this.service.findListCaseMainInfo(query);
  }

  @Post('reindex')
  @UseGuards(JwtAuthGuard, RolesGuard, DomainRestrictionGuard)
  @Roles(...ADMIN_ROLES)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async reindexCases(): Promise<ReindexResult> {
    return this.caseSearchReindexService.reindex();
  }
}
