import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { BaseCrudController } from 'src/core/crud/base.controller';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ArticleMainInfoDto } from './dto/article-main-info.dto';
import { ArticleSearchReindexService } from './article-search-reindex.service';
import { ReindexResult } from '../search/interfaces/reindex-result.interface';
import { ContentListQueryDto } from 'src/shared/dto/content-list-query.dto';
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

@ApiTags('Статьи (админ)')
@Controller('admin/articles')
export class ArticlesAdminController extends BaseCrudController<
  Article,
  CreateArticleDto,
  UpdateArticleDto
> {
  protected entityName!: string;

  constructor(
    protected readonly service: ArticlesService,
    private readonly articleSearchReindexService: ArticleSearchReindexService,
  ) {
    super(service);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, DomainRestrictionGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать статью' })
  @ApiCreatedResponse({ description: 'Статья создана' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() dto: CreateArticleDto): Promise<Article> {
    return this.service.createArticle(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Список всех статей (с пагинацией)' })
  @ApiOkResponse({ description: 'Пагинированный список' })
  async paginate(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<PaginationResult<Article>> {
    return this.service.paginate({}, { page: +page, limit: +limit });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить статью по ID' })
  @ApiOkResponse({ description: 'Статья найдена' })
  @ApiNotFoundResponse({ description: 'Статья не найдена' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Article> {
    return this.service.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, DomainRestrictionGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить статью по ID' })
  @ApiOkResponse({ description: 'Статья обновлена' })
  @ApiNotFoundResponse({ description: 'Статья не найдена' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArticleDto,
  ): Promise<Article> {
    return this.service.updateArticle(id, dto);
  }

  @Get('all/main-info')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Список всех статей с основной информацией (админ)' })
  @ApiOkResponse({ description: 'Список статей с пагинацией' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getMainServiceInfoList(
    @Query() query: ContentListQueryDto,
  ): Promise<AdminPaginatedResponse<ArticleMainInfoDto>> {
    return this.service.findListArticleMainInfo(query);
  }

  @Post('reindex')
  @UseGuards(JwtAuthGuard, RolesGuard, DomainRestrictionGuard)
  @Roles(...ADMIN_ROLES)
  @ApiBearerAuth()
  async reindexArticles(): Promise<ReindexResult> {
    return this.articleSearchReindexService.reindex();
  }
}
