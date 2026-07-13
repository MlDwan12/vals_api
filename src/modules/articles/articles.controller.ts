import { Controller, Get, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ArticleMainInfoDto } from './dto/article-main-info.dto';
import { ContentListQueryDto } from 'src/shared/dto/content-list-query.dto';
import { SimilarContentQueryDto } from 'src/shared/dto/similar-content-query.dto';
import { AdminPaginatedResponse } from 'src/core/crud/interfaces/pagination.interface';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly service: ArticlesService) {}

  @Get('similar')
  @ApiOperation({ summary: 'Похожие статьи по совпадению тегов (сайт)' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getSimilarArticles(
    @Query() query: SimilarContentQueryDto,
  ): Promise<ArticleMainInfoDto[]> {
    return this.service.findSimilarPublished(query.tagIds, query.excludeId, query.limit);
  }

  @Get('published/main-info')
  @ApiOperation({ summary: 'Получить список опубликованных статей с пагинацией (сайт)' })
  @ApiOkResponse({ description: 'Список опубликованных статей с пагинацией' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getPublishedMainInfoList(
    @Query() query: ContentListQueryDto,
  ): Promise<AdminPaginatedResponse<ArticleMainInfoDto>> {
    return this.service.findListPublishedArticleMainInfo(query);
  }

  @Get('info/:slug')
  @ApiOperation({ summary: 'Получить опубликованную статью по slug (сайт)' })
  @ApiOkResponse({ description: 'Статья найдена' })
  @ApiNotFoundResponse({ description: 'Статья не найдена или не опубликована' })
  async getArticleInfo(@Param('slug') slug: string) {
    return this.service.findPublishedBySlugOrFail(slug);
  }
}
