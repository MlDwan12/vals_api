import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { BaseCrudService } from 'src/core/crud/base.service';
import { ArticleRepository } from './articles.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { PinoLogger } from 'nestjs-pino';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { ARTICLE_MAIN_FIELDS } from './queries/article.selects';
import { ArticleMainInfoDto } from './dto/article-main-info.dto';
import { ArticleSearchDocumentBuilder } from '../search/builders/article-search-document.builder';
import { SearchIndexService } from '../search/services/search-index.service';

@Injectable()
export class ArticlesService extends BaseCrudService<
  Article,
  CreateArticleDto,
  UpdateArticleDto
> {
  // protected repository: BaseCrudRepository<Article>;
  constructor(
    // @InjectRepository(Article) private readonly repo: Repository<Article>,
    protected readonly logger: PinoLogger,
    protected readonly repository: ArticleRepository,
    private readonly searchIndexService: SearchIndexService,
    private readonly articleSearchDocumentBuilder: ArticleSearchDocumentBuilder,
  ) {
    super(logger);
    this.repository = repository;
  }

  // async findListArticleMainInfo(): Promise<Article[]> {
  //   return this.repository.repository
  //     .createQueryBuilder('articles')
  //     .select([...ARTICLE_MAIN_FIELDS])
  //     .getMany();
  // }

  async createArticle(dto: CreateArticleDto) {
    const article = await this.repository.create(dto);

    await this.searchIndexService.upsertDocument(
      this.articleSearchDocumentBuilder.build(article),
    );

    return article;
  }

  async updateArticle(id: number, dto: UpdateArticleDto): Promise<Article> {
    const updatedArticle = await this.repository.update(id, dto);

    await this.searchIndexService.upsertDocument(
      this.articleSearchDocumentBuilder.build(updatedArticle!),
    );

    return updatedArticle!;
  }

  async deleteArticle(id: number): Promise<void> {
    const article = await this.findOneOrFail({ where: { id } });

    await this.repository.delete(id);

    await this.searchIndexService.deleteDocument(`article_${article.id}`);
  }

  async findListArticleMainInfo(): Promise<ArticleMainInfoDto[]> {
    return this.repository.findMainInfoList();
  }

  async findBySlugOrFail(slug: string): Promise<Article> {
    const article = await this.repository.findBySlug(slug);

    if (!article) {
      throw new NotFoundException(`Статья со slug "${slug}" не найдена`);
    }

    return article;
  }
}
