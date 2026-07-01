import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { BaseCrudController } from 'src/core/crud/base.controller';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ArticleMainInfoDto } from './dto/article-main-info.dto';
import { ArticleSearchReindexService } from './article-search-reindex.service';
import { ReindexResult } from '../search/interfaces/reindex-result.interface';
import { AdminListQueryDto } from 'src/shared/dto/admin-list-query.dto';
import { AdminPaginatedResponse } from 'src/core/crud/interfaces/pagination.interface';

@Controller('articles')
export class ArticlesController extends BaseCrudController<
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
  async create(@Body() dto: CreateArticleDto): Promise<Article> {
    return this.service.createArticle(dto);
  }

  @Get('all/main-info')
  @ApiOperation({ summary: 'Получить список статей с основной информацией' })
  @ApiOkResponse({ description: 'Список статей с пагинацией' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getMainServiceInfoList(
    @Query() query: AdminListQueryDto,
  ): Promise<AdminPaginatedResponse<ArticleMainInfoDto>> {
    return this.service.findListArticleMainInfo(query);
  }

  @Get('published/main-info')
  @ApiOperation({ summary: 'Получить список опубликованных статей с пагинацией (сайт)' })
  @ApiOkResponse({ description: 'Список опубликованных статей с пагинацией' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getPublishedMainInfoList(
    @Query() query: AdminListQueryDto,
  ): Promise<AdminPaginatedResponse<ArticleMainInfoDto>> {
    return this.service.findListPublishedArticleMainInfo(query);
  }

  @Get('info/:slug')
  @ApiOperation({ summary: 'Получить опубликованную статью по slug (сайт)' })
  @ApiOkResponse({ description: 'Статья найдена' })
  @ApiNotFoundResponse({ description: 'Статья не найдена или не опубликована' })
  async getArticleInfo(@Param('slug') slug: string) {
    return await this.service.findPublishedBySlugOrFail(slug);
  }

  @Post('reindex')
  async reindexArticles(): Promise<ReindexResult> {
    return this.articleSearchReindexService.reindex();
  }
}
