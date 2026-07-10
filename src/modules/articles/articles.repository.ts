import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { LessThanOrEqual, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { ARTICLE_MAIN_FIELDS } from './queries/article.selects';
import { EMPLOYEE_SHORT_FIELDS } from '../employees/queries/employee.selects';
import { ArticleMainInfoDto } from './dto/article-main-info.dto';
import { ContentListQueryDto } from 'src/shared/dto/content-list-query.dto';
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
    const { page, limit, search, sortBy, authorSlug } = query;
    const sort = sortBy ? sortMap[sortBy] : sortMap[SortByDate.CREATED_DESC];

    const qb = this.repository
      .createQueryBuilder('article')
      .leftJoin('article.authors', 'author')
      .select([...ARTICLE_MAIN_FIELDS])
      .addSelect([...EMPLOYEE_SHORT_FIELDS])
      .orderBy(sort.column, sort.direction)
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere('article.title ILIKE :search', { search: `%${search}%` });
    }
    applyAuthorSlugFilter(qb, authorSlug);

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
    const { page, limit, search, sortBy, authorSlug } = query;
    const sort = sortBy ? sortMap[sortBy] : sortMap[SortByDate.PUBLISHED_DESC];

    const qb = this.repository
      .createQueryBuilder('article')
      .leftJoin('article.authors', 'author')
      .select([...ARTICLE_MAIN_FIELDS])
      .addSelect([...EMPLOYEE_SHORT_FIELDS])
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

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items as ArticleMainInfoDto[],
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string): Promise<Article | null> {
    return this.repository.findOne({
      where: { slug },
      relations: { authors: true },
    });
  }

  async findBySlugPublished(slug: string): Promise<Article | null> {
    return this.repository.findOne({
      where: { slug, datePublished: LessThanOrEqual(new Date()) },
      relations: { authors: true },
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
