import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { BaseCrudService } from 'src/core/crud/base.service';
import { ArticleRepository } from './articles.repository';
import { PinoLogger } from 'nestjs-pino';
import { ArticleMainInfoDto } from './dto/article-main-info.dto';
import { ArticleSearchDocumentBuilder } from '../search/builders/article-search-document.builder';
import { SearchIndexService } from '../search/services/search-index.service';
import { AdminListQueryDto } from 'src/shared/dto/admin-list-query.dto';
import { AdminPaginatedResponse } from 'src/core/crud/interfaces/pagination.interface';

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

  async findListArticleMainInfo(
    query: AdminListQueryDto,
  ): Promise<AdminPaginatedResponse<ArticleMainInfoDto>> {
    return this.repository.findMainInfoList(query);
  }

  /** Публичный эндпоинт сайта — только опубликованные (datePublished <= now) */
  async findListPublishedArticleMainInfo(
    query: AdminListQueryDto,
  ): Promise<AdminPaginatedResponse<ArticleMainInfoDto>> {
    return this.repository.findPublishedMainInfoList(query);
  }

  async findBySlugOrFail(slug: string): Promise<Article> {
    const article = await this.repository.findBySlug(slug);

    if (!article) {
      throw new NotFoundException(`Статья со slug "${slug}" не найдена`);
    }

    return article;
  }

  /** Публичный эндпоинт сайта — только опубликованные (datePublished <= now) */
  async findPublishedBySlugOrFail(slug: string): Promise<Article> {
    const article = await this.repository.findBySlugPublished(slug);

    if (!article) {
      throw new NotFoundException(`Статья со slug "${slug}" не найдена`);
    }

    return article;
  }
}
