import { Injectable } from '@nestjs/common';
import { CreateArticleFaqDto } from './dto/create-article-faq.dto';
import { UpdateArticleFaqDto } from './dto/update-article-faq.dto';
import { ArticleFaq } from '../articles/entities/article-faq.entity';
import { ArticleFaqRepository } from './article-faq.repository';
import { PinoLogger } from 'nestjs-pino';
import { BaseCrudService } from 'src/core/crud/base.service';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ArticleFaqService extends BaseCrudService<
  ArticleFaq,
  CreateArticleFaqDto,
  UpdateArticleFaqDto
> {
  protected repository: BaseCrudRepository<ArticleFaq>;

  constructor(
    @InjectRepository(ArticleFaq) private readonly repo: Repository<ArticleFaq>,
    protected readonly logger: PinoLogger,
  ) {
    super(logger);
    this.repository = new ArticleFaqRepository(this.repo);
  }
}
