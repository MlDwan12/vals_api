import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { LessThanOrEqual, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { ARTICLE_MAIN_FIELDS } from './queries/article.selects';
import { EMPLOYEE_SHORT_FIELDS } from '../employees/queries/employee.selects';
import { TAG_SHORT_FIELDS } from '../tags/queries/tag.selects';
import { ArticleMainInfoDto } from './dto/article-main-info.dto';
import { ContentListQueryDto } from 'src/shared/dto/content-list-query.dto';
import { ContentSitemapItemDto } from 'src/shared/dto/content-sitemap-item.dto';
import { SortByDate } from 'src/shared/enums/sort-by-date.enum';
import { AdminPaginatedResponse } from 'src/core/crud/interfaces/pagination.interface';

const sortMap: Record<SortByDate, { column: string; direction: 'ASC' | 'DESC' }> = {
  [SortByDate.UPDATED_DESC]:   { column: 'article.updatedAt',     direction: 'DESC' },
  [SortByDate.UPDATED_ASC]:    { column: 'article.updatedAt',     direction: 'ASC'  },
  [SortByDate.CREATED_DESC]:   { column: 'article.createdAt',     direction: 'DESC' },
  [SortByDate.CREATED_ASC]:    { column: 'article.createdAt',     direction: 'ASC'  },
  [SortByDate.PUBLISHED_DESC]: { column: 'article.datePublished', direction: 'DESC' },
  [SortByDate.PUBLISHED_ASC]:  { column: 'article.datePublished', direction: 'ASC'  },
};

/**
 * Фильтр «только материалы этого автора» — намеренно отдельный подзапрос,
 * а не условие на join-алиасе `author` (см. leftJoin ниже). Если фильтровать
 * прямо на `author.slug`, у статей с несколькими соавторами из результата
 * пропадут все совпавшие строки, кроме автора-фильтра — join используется
 * только для подгрузки ПОЛНОГО списка авторов, не для фильтрации.
 */
function applyAuthorSlugFilter(
  qb: SelectQueryBuilder<Article>,
  authorSlug?: string,
): void {
  if (!authorSlug) return;

  qb.andWhere((sub) => {
    const subQuery = sub
      .subQuery()
      .select('aa.article_id')
      .from('article_authors', 'aa')
      .innerJoin('employees', 'e', 'e.id = aa.employee_id')
      .where('e.slug = :authorSlug')
      .getQuery();
    return `article.id IN ${subQuery}`;
  }).setParameter('authorSlug', authorSlug);
}

/** Фильтр «только материалы с этим тегом» — тот же приём подзапроса, что и у авторов (см. выше). */
function applyTagSlugFilter(
  qb: SelectQueryBuilder<Article>,
  tagSlug?: string,
): void {
  if (!tagSlug) return;

  qb.andWhere((sub) => {
    const subQuery = sub
      .subQuery()
      .select('at.article_id')
      .from('article_tags', 'at')
      .innerJoin('tags', 't', 't.id = at.tag_id')
      .where('t.slug = :tagSlug')
      .getQuery();
    return `article.id IN ${subQuery}`;
  }).setParameter('tagSlug', tagSlug);
}

@Injectable()
export class ArticleRepository extends BaseCrudRepository<Article> {
  constructor(
    @InjectRepository(Article)
    repo: Repository<Article>,
  ) {
    super(repo, Article);
  }

  async findMainInfoList(
    query: ContentListQueryDto,
  ): Promise<AdminPaginatedResponse<ArticleMainInfoDto>> {
    const { page, limit, search, sortBy, authorSlug, tagSlug } = query;
    const sort = sortBy ? sortMap[sortBy] : sortMap[SortByDate.CREATED_DESC];

    const qb = this.repository
      .createQueryBuilder('article')
      .leftJoin('article.authors', 'author')
      .leftJoin('article.tags', 'tag')
      .select([...ARTICLE_MAIN_FIELDS])
      .addSelect([...EMPLOYEE_SHORT_FIELDS])
      .addSelect([...TAG_SHORT_FIELDS])
      .orderBy(sort.column, sort.direction)
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere('article.title ILIKE :search', { search: `%${search}%` });
    }
    applyAuthorSlugFilter(qb, authorSlug);
    applyTagSlugFilter(qb, tagSlug);

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items as ArticleMainInfoDto[],
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** Публичный эндпоинт сайта — только опубликованные (datePublished <= now) */
  async findPublishedMainInfoList(
    query: ContentListQueryDto,
  ): Promise<AdminPaginatedResponse<ArticleMainInfoDto>> {
    const { page, limit, search, sortBy, authorSlug, tagSlug } = query;
    const sort = sortBy ? sortMap[sortBy] : sortMap[SortByDate.PUBLISHED_DESC];

    const qb = this.repository
      .createQueryBuilder('article')
      .leftJoin('article.authors', 'author')
      .leftJoin('article.tags', 'tag')
      .select([...ARTICLE_MAIN_FIELDS])
      .addSelect([...EMPLOYEE_SHORT_FIELDS])
      .addSelect([...TAG_SHORT_FIELDS])
      .where('article.datePublished IS NOT NULL')
      .andWhere('article.datePublished <= :now', { now: new Date() })
      .orderBy('article.priority', 'DESC')
      .addOrderBy(sort.column, sort.direction)
      .addOrderBy('article.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere('article.title ILIKE :search', { search: `%${search}%` });
    }
    applyAuthorSlugFilter(qb, authorSlug);
    applyTagSlugFilter(qb, tagSlug);

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items as ArticleMainInfoDto[],
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Все опубликованные статьи, без пагинации — только slug/title/updatedAt.
   * Для sitemap.xml и человекочитаемой карты сайта, не для обычных списков
   * на сайте (там нужна пагинация — см. findPublishedMainInfoList выше).
   */
  async findAllPublishedSlim(): Promise<ContentSitemapItemDto[]> {
    return this.repository
      .createQueryBuilder('article')
      .select('article.slug', 'slug')
      .addSelect('article.title', 'title')
      .addSelect('article.updatedAt', 'updatedAt')
      .where('article.datePublished IS NOT NULL')
      .andWhere('article.datePublished <= :now', { now: new Date() })
      .orderBy('article.datePublished', 'DESC')
      .getRawMany();
  }

  async findBySlug(slug: string): Promise<Article | null> {
    return this.repository.findOne({
      where: { slug },
      relations: { authors: true, tags: true, faq: true },
      order: { faq: { orderIndex: 'ASC' } },
    });
  }

  async findBySlugPublished(slug: string): Promise<Article | null> {
    return this.repository.findOne({
      where: { slug, datePublished: LessThanOrEqual(new Date()) },
      relations: { authors: true, tags: true, faq: true },
      order: { faq: { orderIndex: 'ASC' } },
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

  /** Похожие статьи (шаг 1) — id опубликованных статей, ранжированные по числу совпавших тегов. */
  async findSimilarRankedIds(
    tagIds: number[],
    excludeId: number | undefined,
    limit: number,
  ): Promise<number[]> {
    const qb = this.repository
      .createQueryBuilder('article')
      .innerJoin('article_tags', 'at', 'at.article_id = article.id')
      .select('article.id', 'id')
      .addSelect('COUNT(DISTINCT at.tag_id)', 'matched')
      .where('at.tag_id IN (:...tagIds)', { tagIds })
      .andWhere('article.datePublished IS NOT NULL')
      .andWhere('article.datePublished <= :now', { now: new Date() })
      .groupBy('article.id')
      .orderBy('matched', 'DESC')
      .addOrderBy('article.priority', 'DESC')
      .addOrderBy('article.datePublished', 'DESC')
      .limit(limit);

    if (excludeId) {
      qb.andWhere('article.id != :excludeId', { excludeId });
    }

    const rows = await qb.getRawMany<{ id: number; matched: string }>();
    return rows.map((r) => r.id);
  }

  /** Похожие статьи (шаг 2) — полная main-info выборка по уже ранжированным id, порядок сохраняется. */
  async findMainInfoByIds(ids: number[]): Promise<ArticleMainInfoDto[]> {
    if (!ids.length) return [];

    const items = await this.repository
      .createQueryBuilder('article')
      .leftJoin('article.authors', 'author')
      .leftJoin('article.tags', 'tag')
      .select([...ARTICLE_MAIN_FIELDS])
      .addSelect([...EMPLOYEE_SHORT_FIELDS])
      .addSelect([...TAG_SHORT_FIELDS])
      .where('article.id IN (:...ids)', { ids })
      .getMany();

    const order = new Map(ids.map((id, idx) => [id, idx]));
    return (items as ArticleMainInfoDto[]).sort(
      (a, b) => order.get(a.id)! - order.get(b.id)!,
    );
  }
}
