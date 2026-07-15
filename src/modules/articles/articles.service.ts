import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { ArticleFaq } from './entities/article-faq.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Tag } from '../tags/entities/tag.entity';
import { BaseCrudService } from 'src/core/crud/base.service';
import { ArticleRepository } from './articles.repository';
import { PinoLogger } from 'nestjs-pino';
import { ArticleMainInfoDto } from './dto/article-main-info.dto';
import { ArticleSearchDocumentBuilder } from '../search/builders/article-search-document.builder';
import { SearchIndexService } from '../search/services/search-index.service';
import { ContentListQueryDto } from 'src/shared/dto/content-list-query.dto';
import { AdminPaginatedResponse } from 'src/core/crud/interfaces/pagination.interface';

@Injectable()
export class ArticlesService extends BaseCrudService<
  Article,
  CreateArticleDto,
  UpdateArticleDto
> {
  constructor(
    protected readonly logger: PinoLogger,
    protected readonly repository: ArticleRepository,
    private readonly searchIndexService: SearchIndexService,
    private readonly articleSearchDocumentBuilder: ArticleSearchDocumentBuilder,
  ) {
    super(logger);
  }

  async createArticle(dto: CreateArticleDto): Promise<Article> {
    return this.repository.transaction(async (em) => {
      const authorIds = this.normalizeAuthorIds(dto.authorIds);

      const authors = await em.getRepository(Employee).find({
        where: { id: In(authorIds) },
        select: ['id'],
      });
      this.assertAllAuthorsFound(authorIds, authors.map((a) => a.id));

      const tagIds = this.dedupeTagIds(dto.tagIds);
      const tags = tagIds.length
        ? await em.getRepository(Tag).find({ where: { id: In(tagIds) }, select: ['id'] })
        : [];
      if (tagIds.length) this.assertAllTagsFound(tagIds, tags.map((t) => t.id));

      const entity = em.getRepository(Article).create({
        slug: dto.slug,
        title: dto.title,
        description: dto.description,
        content: dto.content,
        contentHtml: dto.contentHtml,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        keywords: dto.keywords,
        datePublished: dto.datePublished ? new Date(dto.datePublished) : null,
        priority: dto.priority ?? 0,
        readingTime: dto.readingTime ?? null,
        authors,
        tags,
      });

      const saved = await em.getRepository(Article).save(entity);

      if (dto.faq?.length) {
        await this.saveFaq(em, saved.id, dto.faq);
      }

      await this.searchIndexService.upsertDocument(
        this.articleSearchDocumentBuilder.build(saved),
      );

      return saved;
    });
  }

  /** Полная замена FAQ статьи — форма админки всегда шлёт целиком актуальный список. */
  private async saveFaq(
    em: EntityManager,
    articleId: number,
    faq: { question: string; answer: string }[],
  ): Promise<void> {
    const faqRepo = em.getRepository(ArticleFaq);
    await faqRepo.delete({ articleId });

    if (!faq.length) return;

    await faqRepo.insert(
      faq.map((item, index) => ({
        articleId,
        question: item.question,
        answer: item.answer,
        orderIndex: index,
      })),
    );
  }

  async updateArticle(id: number, dto: UpdateArticleDto): Promise<Article> {
    return this.repository.transaction(async (em) => {
      const articleRepo = em.getRepository(Article);
      const existing = await articleRepo.findOne({
        where: { id },
        relations: { authors: true, tags: true },
      });

      if (!existing) {
        throw new NotFoundException(`Статья с ID ${id} не найдена`);
      }

      if (dto.authorIds) {
        const authorIds = this.normalizeAuthorIds(dto.authorIds);

        const authors = await em.getRepository(Employee).find({
          where: { id: In(authorIds) },
          select: ['id'],
        });
        this.assertAllAuthorsFound(authorIds, authors.map((a) => a.id));
        existing.authors = authors;
      }

      if (dto.tagIds !== undefined) {
        const tagIds = this.dedupeTagIds(dto.tagIds);

        const tags = tagIds.length
          ? await em.getRepository(Tag).find({ where: { id: In(tagIds) }, select: ['id'] })
          : [];
        if (tagIds.length) this.assertAllTagsFound(tagIds, tags.map((t) => t.id));
        existing.tags = tags;
      }

      if (dto.slug !== undefined) existing.slug = dto.slug;
      if (dto.title !== undefined) existing.title = dto.title;
      if (dto.description !== undefined) existing.description = dto.description;
      if (dto.content !== undefined) existing.content = dto.content;
      if (dto.contentHtml !== undefined) existing.contentHtml = dto.contentHtml;
      if (dto.metaTitle !== undefined) existing.metaTitle = dto.metaTitle;
      if (dto.metaDescription !== undefined) existing.metaDescription = dto.metaDescription;
      if (dto.keywords !== undefined) existing.keywords = dto.keywords;
      if ('datePublished' in dto) {
        existing.datePublished = dto.datePublished ? new Date(dto.datePublished) : null;
      }
      if (dto.priority !== undefined) existing.priority = dto.priority;
      if (dto.readingTime !== undefined) existing.readingTime = dto.readingTime;

      const saved = await articleRepo.save(existing);

      if (dto.faq !== undefined) {
        await this.saveFaq(em, saved.id, dto.faq);
      }

      await this.searchIndexService.upsertDocument(
        this.articleSearchDocumentBuilder.build(saved),
      );

      return saved;
    });
  }

  private normalizeAuthorIds(ids: number[]): number[] {
    const uniq = Array.from(new Set(ids));
    if (uniq.length === 0) {
      throw new BadRequestException('authorIds не должен быть пустым');
    }
    return uniq;
  }

  private assertAllAuthorsFound(requested: number[], found: number[]): void {
    if (found.length === requested.length) return;

    const foundSet = new Set(found);
    const missing = requested.filter((id) => !foundSet.has(id));

    throw new BadRequestException(`Сотрудники не найдены: ${missing.join(', ')}`);
  }

  /** Теги необязательны — в отличие от normalizeAuthorIds, не кидает на пустом/undefined массиве. */
  private dedupeTagIds(ids?: number[]): number[] {
    return Array.from(new Set(ids ?? []));
  }

  private assertAllTagsFound(requested: number[], found: number[]): void {
    if (found.length === requested.length) return;

    const foundSet = new Set(found);
    const missing = requested.filter((id) => !foundSet.has(id));

    throw new BadRequestException(`Теги не найдены: ${missing.join(', ')}`);
  }

  async deleteArticle(id: number): Promise<void> {
    const article = await this.findOneOrFail({ where: { id } });

    await this.repository.delete(id);

    await this.searchIndexService.deleteDocument(`article_${article.id}`);
  }

  /** Переопределяет generic findById — форме редактирования в админке нужны текущие авторы, теги и FAQ. */
  async findById(id: number): Promise<Article> {
    const article = await this.repository.findById(id, {
      relations: { authors: true, tags: true, faq: true },
      order: { faq: { orderIndex: 'ASC' } },
    });

    if (!article) {
      throw new NotFoundException(`Статья с ID ${id} не найдена`);
    }

    return article;
  }

  async findListArticleMainInfo(
    query: ContentListQueryDto,
  ): Promise<AdminPaginatedResponse<ArticleMainInfoDto>> {
    return this.repository.findMainInfoList(query);
  }

  /** Публичный эндпоинт сайта — только опубликованные (datePublished <= now) */
  async findListPublishedArticleMainInfo(
    query: ContentListQueryDto,
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

  /** Все опубликованные статьи без пагинации — sitemap.xml и человекочитаемая карта сайта. */
  async findAllPublishedSitemapItems() {
    return this.repository.findAllPublishedSlim();
  }

  /** Похожие статьи по совпадению тегов — блок «Похожие статьи» на странице статьи/кейса. */
  async findSimilarPublished(
    tagIds: number[],
    excludeId: number | undefined,
    limit = 6,
  ): Promise<ArticleMainInfoDto[]> {
    if (!tagIds.length) return [];

    const ids = await this.repository.findSimilarRankedIds(tagIds, excludeId, limit);
    return this.repository.findMainInfoByIds(ids);
  }
}
