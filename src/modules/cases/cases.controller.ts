import { Controller, Get, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CasesService } from './cases.service';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ContentListQueryDto } from 'src/shared/dto/content-list-query.dto';
import { ContentSitemapItemDto } from 'src/shared/dto/content-sitemap-item.dto';
import { SimilarContentQueryDto } from 'src/shared/dto/similar-content-query.dto';
import { AdminPaginatedResponse } from 'src/core/crud/interfaces/pagination.interface';
import { Case } from './entities/case.entity';

@ApiTags('Кейсы')
@Controller('cases')
export class CasesController {
  constructor(private readonly service: CasesService) {}

  @Get('similar')
  @ApiOperation({ summary: 'Похожие кейсы по совпадению тегов (сайт)' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getSimilarCases(@Query() query: SimilarContentQueryDto): Promise<Case[]> {
    return this.service.findSimilarPublished(query.tagIds, query.excludeId, query.limit);
  }

  @Get('published/main-info')
  @ApiOperation({ summary: 'Получить список опубликованных кейсов с пагинацией (сайт)' })
  @ApiOkResponse({ description: 'Список опубликованных кейсов с пагинацией' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getPublishedMainInfoList(
    @Query() query: ContentListQueryDto,
  ): Promise<AdminPaginatedResponse<Case>> {
    return this.service.findListPublishedCaseMainInfo(query);
  }

  @Get('published/all')
  @ApiOperation({ summary: 'Все опубликованные кейсы без пагинации (sitemap.xml, карта сайта)' })
  @ApiOkResponse({ description: 'Полный список опубликованных кейсов (slug/title/updatedAt)' })
  async getPublishedAll(): Promise<ContentSitemapItemDto[]> {
    return this.service.findAllPublishedSitemapItems();
  }

  @Get('service/:slug')
  async getCasesByServiceSlug(@Param('slug') slug: string) {
    return this.service.getCasesByServiceSlug(slug);
  }

  @Get('info/case/:slug')
  @ApiOperation({ summary: 'Получить кейс по slug (сайт)' })
  @ApiOkResponse({ description: 'Кейс найден' })
  @ApiNotFoundResponse({ description: 'Кейс не найден' })
  async findByCaseSlug(@Param('slug') slug: string) {
    return this.service.getCaseBySlug(slug);
  }
}
