import { Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { Faq } from './entities/faq.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReindexResult } from '../search/interfaces/reindex-result.interface';
import { FaqSearchReindexService } from './faq-search-reindex.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { DomainRestrictionGuard } from 'src/common/guards/domain-restriction.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ADMIN_ROLES,
  CONTENT_ROLES,
} from 'src/common/constants/roles.constant';
import type { PaginationResult } from 'src/core/crud/interfaces/pagination.interface';

@ApiTags('FAQ (админ)')
@Controller('admin/faq')
export class FaqAdminController extends BaseCrudController<
  Faq,
  CreateFaqDto,
  UpdateFaqDto
> {
  protected entityName: string;

  constructor(
    protected readonly service: FaqService,
    private readonly faqSearchReindexService: FaqSearchReindexService,
  ) {
    super(service);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  async paginate(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<PaginationResult<Faq>> {
    return this.service.paginate({}, { page: +page, limit: +limit });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Faq> {
    return this.service.findById(id);
  }

  @Post('reindex')
  @UseGuards(JwtAuthGuard, RolesGuard, DomainRestrictionGuard)
  @Roles(...ADMIN_ROLES)
  @ApiBearerAuth()
  async reindexFaq(): Promise<ReindexResult> {
    return this.faqSearchReindexService.reindex();
  }
}
