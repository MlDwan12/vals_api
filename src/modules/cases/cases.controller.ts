import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
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

@ApiTags('Кейсы')
@Controller('cases')
export class CasesController extends BaseCrudController<
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

  @Get('all/main-info')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getMainCaseInfoList(
    @Query() query: AdminListQueryDto,
  ): Promise<AdminPaginatedResponse<Case>> {
    try {
      return await this.service.findListCaseMainInfo(query);
    } catch (e) {
      console.error('REAL ERROR:', e);
      throw e;
    }
  }

  @Get('service/:slug')
  async getCasesByServiceSlug(@Param('slug') slug: string) {
    try {
      return await this.service.getCasesByServiceSlug(slug);
    } catch (e) {
      console.error('REAL ERROR:', e);
      throw e;
    }
  }

  @Get('info/case/:slug')
  @ApiOperation({ summary: 'Получить элемент по ID' })
  @ApiOkResponse({ description: 'Элемент найден' })
  @ApiNotFoundResponse({ description: 'Элемент не найден' })
  @ApiBearerAuth()
  async findBySlug(@Param('slug') slug: string) {
    if (slug) return this.service.getCaseBySlug(slug);
  }

  @Post('reindex')
  @HttpCode(HttpStatus.OK)
  async reindexCases(): Promise<ReindexResult> {
    return this.caseSearchReindexService.reindex();
  }
}
