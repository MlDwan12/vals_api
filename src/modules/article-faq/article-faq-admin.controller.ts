import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ArticleFaqService } from './article-faq.service';
import { CreateArticleFaqDto } from './dto/create-article-faq.dto';
import { UpdateArticleFaqDto } from './dto/update-article-faq.dto';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { ArticleFaq } from '../articles/entities/article-faq.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CONTENT_ROLES } from 'src/common/constants/roles.constant';
import type { PaginationResult } from 'src/core/crud/interfaces/pagination.interface';

@ApiTags('FAQ статей (админ)')
@Controller('admin/article-faq')
export class ArticleFaqAdminController extends BaseCrudController<
  ArticleFaq,
  CreateArticleFaqDto,
  UpdateArticleFaqDto
> {
  protected entityName: string;

  constructor(protected readonly service: ArticleFaqService) {
    super(service);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  async paginate(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<PaginationResult<ArticleFaq>> {
    return this.service.paginate({}, { page: +page, limit: +limit });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  async findById(@Param('id', ParseIntPipe) id: number): Promise<ArticleFaq> {
    return this.service.findById(id);
  }
}
