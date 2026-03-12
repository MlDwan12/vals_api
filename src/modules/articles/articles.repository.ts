import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';

@Injectable()
export class ArticleRepository extends BaseCrudRepository<Article> {
  constructor(
    @InjectRepository(Article)
    repo: Repository<Article>,
  ) {
    super(repo, Article);
  }
}
