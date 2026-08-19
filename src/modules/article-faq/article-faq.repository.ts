import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { ArticleFaq } from '../articles/entities/article-faq.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ArticleFaqRepository extends BaseCrudRepository<ArticleFaq> {
  constructor(
    @InjectRepository(ArticleFaq)
    repo: Repository<ArticleFaq>,
  ) {
    super(repo, ArticleFaq);
  }
}
