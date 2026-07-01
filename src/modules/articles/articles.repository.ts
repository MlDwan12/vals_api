import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { LessThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { ARTICLE_MAIN_FIELDS } from './queries/article.selects';
import { ArticleMainInfoDto } from './dto/article-main-info.dto';
import { AdminListQueryDto } from 'src/shared/dto/admin-list-query.dto';
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

@Injectable()
export class ArticleRepository extends BaseCrudRepository<Article> {
  constructor(
    @InjectRepository(Article)
    repo: Repository<Article>,
  ) {
    super(repo, Article);
  }

  async findMainInfoList(
    query: AdminListQueryDto,
  ): Promise<AdminPaginatedResponse<ArticleMainInfoDto>> {
    const { page, limit, search, sortBy } = query;
    const sort = sortBy ? sortMap[sortBy] : sortMap[SortByDate.CREATED_DESC];

    const qb = this.repository
      .createQueryBuilder('article')
      .select([...ARTICLE_MAIN_FIELDS])
      .orderBy(sort.column, sort.direction)
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.where('article.title ILIKE :search', { search: `%${search}%` });
    }

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
    query: AdminListQueryDto,
  ): Promise<AdminPaginatedResponse<ArticleMainInfoDto>> {
    const { page, limit, search, sortBy } = query;
    const sort = sortBy ? sortMap[sortBy] : sortMap[SortByDate.CREATED_DESC];

    const qb = this.repository
      .createQueryBuilder('article')
      .select([...ARTICLE_MAIN_FIELDS])
      .where('article.datePublished IS NOT NULL')
      .andWhere('article.datePublished <= :now', { now: new Date() })
      .orderBy(sort.column, sort.direction)
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere('article.title ILIKE :search', { search: `%${search}%` });
    }

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
    return this.repository.findOne({ where: { slug } });
  }

  async findBySlugPublished(slug: string): Promise<Article | null> {
    return this.repository.findOne({
      where: { slug, datePublished: LessThanOrEqual(new Date()) },
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
