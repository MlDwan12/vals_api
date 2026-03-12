import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { BaseCrudService } from 'src/core/crud/base.service';
import { ArticleRepository } from './articles.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { PinoLogger } from 'nestjs-pino';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { ARTICLE_MAIN_FIELDS } from '../services/queries/service.selects';

@Injectable()
export class ArticlesService extends BaseCrudService<
  Article,
  CreateArticleDto,
  UpdateArticleDto
> {
  protected repository: BaseCrudRepository<Article>;
  constructor(
    @InjectRepository(Article) private readonly repo: Repository<Article>,
    protected readonly logger: PinoLogger,
  ) {
    super(logger);
    this.repository = new ArticleRepository(this.repo);
  }

  async findListArticleMainInfo(): Promise<Article[]> {
    return this.repository.repository
      .createQueryBuilder('articles')
      .select([...ARTICLE_MAIN_FIELDS])
      .getMany();
  }
}
