import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
  @ApiOkResponse({
    description: 'Список статей',
    type: ArticleMainInfoDto,
    isArray: true,
  })
  async getMainServiceInfoList(): Promise<ArticleMainInfoDto[]> {
    return await this.service.findListArticleMainInfo();
  }

  @Get('info/:slug')
  @ApiOperation({ summary: 'Получить элемент по ID' })
  @ApiOkResponse({ description: 'Элемент найден' })
  @ApiNotFoundResponse({ description: 'Элемент не найден' })
  async getArticleInfo(@Param('slug') slug: string) {
    return await this.service.findBySlugOrFail(slug);
  }

  @Post('reindex')
  async reindexArticles(): Promise<ReindexResult> {
    return this.articleSearchReindexService.reindex();
  }
}
