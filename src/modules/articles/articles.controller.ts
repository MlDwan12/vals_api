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

@Controller('articles')
export class ArticlesController extends BaseCrudController<
  Article,
  CreateArticleDto,
  UpdateArticleDto
> {
  protected entityName: string;

  constructor(protected readonly service: ArticlesService) {
    super(service);
  }

  @Get('all/main-info')
  async getMainServiceInfoList() {
    try {
      return await this.service.findListArticleMainInfo();
    } catch (e) {
      console.error('REAL ERROR:', e);
      throw e;
    }
  }

  @Get('info/:slug')
  @ApiOperation({ summary: 'Получить элемент по ID' })
  @ApiOkResponse({ description: 'Элемент найден' })
  @ApiNotFoundResponse({ description: 'Элемент не найден' })
  async getArticleInfo(@Param('slug') slug: string) {
    try {
      return await this.service.findOneOrFail({ where: { slug } });
    } catch (e) {
      console.error('REAL ERROR:', e);
      throw e;
    }
  }
}
