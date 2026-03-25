import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { ARTICLE_MAIN_FIELDS } from './queries/article.selects';
import { ArticleMainInfoDto } from './dto/article-main-info.dto';

@Injectable()
export class ArticleRepository extends BaseCrudRepository<Article> {
  constructor(
    @InjectRepository(Article)
    repo: Repository<Article>,
  ) {
    super(repo, Article);
  }

  async findMainInfoList(): Promise<ArticleMainInfoDto[]> {
    return this.repository
      .createQueryBuilder('article')
      .select([...ARTICLE_MAIN_FIELDS])
      .orderBy('article.createdAt', 'DESC')
      .getMany() as Promise<ArticleMainInfoDto[]>;
  }

  async findBySlug(slug: string): Promise<Article | null> {
    return this.repository.findOne({
      where: { slug },
    });
  }

  async findBatchAfterId(lastId: number, limit: number): Promise<Article[]> {
    return this.repo
      .createQueryBuilder('article')
      .where('article.id > :lastId', { lastId })
      .orderBy('article.id', 'ASC')
      .limit(limit)
      .getMany();
  }
}
