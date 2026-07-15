import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { Case } from './entities/case.entity';
import { CaseFaq } from './entities/case-faq.entity';
import { CaseRepository } from './cases.repository';
import { PinoLogger } from 'nestjs-pino';
import { BaseCrudService } from 'src/core/crud/base.service';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { EntityManager, In, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from '../services/entities/service.entity';
import { CASES_MAIN_FIELDS } from '../services/queries/service.selects';
import { ServicesService } from '../services/services.service';
import { Employee } from '../employees/entities/employee.entity';
import { EmployeeShortDto } from '../employees/dto/employee-short.dto';
import { EMPLOYEE_SHORT_FIELDS } from '../employees/queries/employee.selects';
import { Tag } from '../tags/entities/tag.entity';
import { TagShortDto } from '../tags/dto/tag-short.dto';
import { TAG_SHORT_FIELDS } from '../tags/queries/tag.selects';
import { CaseSearchDocumentBuilder } from '../search/builders/case-search-document.builder';
import { SearchIndexService } from '../search/services/search-index.service';
import { ContentListQueryDto } from 'src/shared/dto/content-list-query.dto';
import { ContentSitemapItemDto } from 'src/shared/dto/content-sitemap-item.dto';
import { SortByDate } from 'src/shared/enums/sort-by-date.enum';
import { AdminPaginatedResponse } from 'src/core/crud/interfaces/pagination.interface';

type CaseRow = {
  id: number;
  slug: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  serviceIds: number[];
  authorIds: number[];
  authors: EmployeeShortDto[];
  tagIds: number[];
  tags: TagShortDto[];
  faq?: { id: number; question: string; answer: string }[];
};

const CASE_SORT_MAP: Record<SortByDate, { column: string; direction: 'ASC' | 'DESC' }> = {
  [SortByDate.UPDATED_DESC]:   { column: 'cases.updatedAt',     direction: 'DESC' },
  [SortByDate.UPDATED_ASC]:    { column: 'cases.updatedAt',     direction: 'ASC'  },
  [SortByDate.CREATED_DESC]:   { column: 'cases.createdAt',     direction: 'DESC' },
  [SortByDate.CREATED_ASC]:    { column: 'cases.createdAt',     direction: 'ASC'  },
  [SortByDate.PUBLISHED_DESC]: { column: 'cases.datePublished', direction: 'DESC' },
  [SortByDate.PUBLISHED_ASC]:  { column: 'cases.datePublished', direction: 'ASC'  },
};

@Injectable()
export class CasesService extends BaseCrudService<
  Case,
  CreateCaseDto,
  UpdateCaseDto
> {
  protected repository: BaseCrudRepository<Case>;
  constructor(
    @InjectRepository(Case) private readonly repo: Repository<Case>,
    protected readonly logger: PinoLogger,
    private readonly servicesService: ServicesService,
    private readonly caseSearchDocumentBuilder: CaseSearchDocumentBuilder,
    private readonly searchIndexService: SearchIndexService,
  ) {
    super(logger);
    this.repository = new CaseRepository(this.repo);
  }

  public async create(dto: CreateCaseDto): Promise<Case> {
    const serviceIds = this.normalizeIds(dto.serviceIds, 'serviceIds');
    const authorIds = this.normalizeIds(dto.authorIds, 'authorIds');
    const tagIds = this.dedupeTagIds(dto.tagIds);

    return this.repository.transaction(async (em) => {
      const services = await em.getRepository(Service).find({
        where: { id: In(serviceIds) },
        select: ['id'],
      });
      this.assertAllFound('Услуги', serviceIds, services.map((s) => s.id));

      const authors = await em.getRepository(Employee).find({
        where: { id: In(authorIds) },
        select: ['id'],
      });
      this.assertAllFound('Сотрудники', authorIds, authors.map((a) => a.id));

      const tags = tagIds.length
        ? await em.getRepository(Tag).find({ where: { id: In(tagIds) }, select: ['id'] })
        : [];
      if (tagIds.length) this.assertAllFound('Теги', tagIds, tags.map((t) => t.id));

      const entity = em.getRepository(Case).create({
        industry: dto.industry,
        title: dto.title,
        slug: dto.slug,
        description: dto.description,
        problem: dto.problem,
        result: dto.result,
        content: dto.content,
        contentHtml: dto.contentHtml,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        keywords: dto.keywords,
        datePublished: dto.datePublished ? new Date(dto.datePublished) : null,
        priority: dto.priority ?? 0,
        services,
        authors,
        tags,
      });

      const saved = await em.getRepository(Case).save(entity);

      if (dto.faq?.length) {
        await this.saveFaq(em, saved.id, dto.faq);
      }

      await this.searchIndexService.upsertDocument(
        this.caseSearchDocumentBuilder.build(saved),
      );
      return em.getRepository(Case).findOneOrFail({
        where: { id: saved.id },
        relations: { services: true, authors: true, tags: true, faq: true },
        order: { faq: { orderIndex: 'ASC' } },
      });
    });
  }

  /** Полная замена FAQ кейса — форма админки всегда шлёт целиком актуальный список. */
  private async saveFaq(
    em: EntityManager,
    caseId: number,
    faq: { question: string; answer: string }[],
  ): Promise<void> {
    const faqRepo = em.getRepository(CaseFaq);
    await faqRepo.delete({ caseId });

    if (!faq.length) return;

    await faqRepo.insert(
      faq.map((item, index) => ({
        caseId,
        question: item.question,
        answer: item.answer,
        orderIndex: index,
      })),
    );
  }

  // ✅ update с M2M (НЕ через repo.update)
  public async update(id: number, dto: UpdateCaseDto): Promise<Case> {
    return this.repository.transaction(async (em) => {
      const caseRepo = em.getRepository(Case);

      const existing = await caseRepo.findOne({
        where: { id },
        relations: { services: true, authors: true, tags: true },
      });

      if (!existing) {
        throw new NotFoundException(`Кейс с ID ${id} не найден`);
      }

      // связи
      if (dto.serviceIds) {
        const serviceIds = this.normalizeIds(dto.serviceIds, 'serviceIds');

        const services = await em.getRepository(Service).find({
          where: { id: In(serviceIds) },
          select: ['id'],
        });
        this.assertAllFound('Услуги', serviceIds, services.map((s) => s.id));
        existing.services = services;
      }

      if (dto.authorIds) {
        const authorIds = this.normalizeIds(dto.authorIds, 'authorIds');

        const authors = await em.getRepository(Employee).find({
          where: { id: In(authorIds) },
          select: ['id'],
        });
        this.assertAllFound('Сотрудники', authorIds, authors.map((a) => a.id));
        existing.authors = authors;
      }

      if (dto.tagIds !== undefined) {
        const tagIds = this.dedupeTagIds(dto.tagIds);

        const tags = tagIds.length
          ? await em.getRepository(Tag).find({ where: { id: In(tagIds) }, select: ['id'] })
          : [];
        if (tagIds.length) this.assertAllFound('Теги', tagIds, tags.map((t) => t.id));
        existing.tags = tags;
      }

      // поля
      if (dto.industry) existing.industry = dto.industry;
      if (dto.title) existing.title = dto.title;
      if (dto.slug) existing.slug = dto.slug;
      if (dto.description !== undefined) existing.description = dto.description;
      if (dto.problem) existing.problem = dto.problem;
      if (dto.result) existing.result = dto.result;
      if (dto.content !== undefined) existing.content = dto.content;
      if (dto.contentHtml !== undefined) existing.contentHtml = dto.contentHtml;
      if (dto.metaTitle !== undefined) existing.metaTitle = dto.metaTitle;
      if (dto.metaDescription !== undefined)
        existing.metaDescription = dto.metaDescription;
      if (dto.keywords !== undefined) existing.keywords = dto.keywords;
      if ('datePublished' in dto) existing.datePublished = dto.datePublished ? new Date(dto.datePublished) : null;
      if (dto.priority !== undefined) existing.priority = dto.priority;

      await caseRepo.save(existing);

      if (dto.faq !== undefined) {
        await this.saveFaq(em, id, dto.faq);
      }

      await this.searchIndexService.upsertDocument(
        this.caseSearchDocumentBuilder.build(
          await caseRepo.findOneOrFail({
            where: { id },
            relations: { services: true, authors: true, tags: true },
          })!,
        ),
      );

      return caseRepo.findOneOrFail({
        where: { id },
        relations: { services: true, authors: true, tags: true, faq: true },
        order: { faq: { orderIndex: 'ASC' } },
      });
    });
  }

  private normalizeIds(ids: number[], fieldName: string): number[] {
    const uniq = Array.from(new Set(ids));
    if (uniq.length === 0) {
      throw new BadRequestException(`${fieldName} не должен быть пустым`);
    }
    return uniq;
  }

  /** Теги необязательны — в отличие от normalizeIds, не кидает на пустом/undefined массиве. */
  private dedupeTagIds(ids?: number[]): number[] {
    return Array.from(new Set(ids ?? []));
  }

  private assertAllFound(entityLabel: string, requested: number[], found: number[]): void {
    if (found.length === requested.length) return;

    const foundSet = new Set(found);
    const missing = requested.filter((id) => !foundSet.has(id));

    throw new BadRequestException(`${entityLabel} не найдены: ${missing.join(', ')}`);
  }

  async findListCaseMainInfo(
    query: ContentListQueryDto,
  ): Promise<AdminPaginatedResponse<Case>> {
    const { page, limit, search, sortBy, authorSlug, tagSlug } = query;
    const sort = sortBy ? CASE_SORT_MAP[sortBy] : CASE_SORT_MAP[SortByDate.UPDATED_DESC];

    const qb = this.repository.repository
      .createQueryBuilder('cases')
      .leftJoin('cases.authors', 'author')
      .leftJoin('cases.tags', 'tag')
      .select([...CASES_MAIN_FIELDS])
      .addSelect([...EMPLOYEE_SHORT_FIELDS])
      .addSelect([...TAG_SHORT_FIELDS])
      .orderBy(sort.column, sort.direction)
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere('cases.title ILIKE :search', { search: `%${search}%` });
    }
    this.applyAuthorSlugFilter(qb, authorSlug);
    this.applyTagSlugFilter(qb, tagSlug);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Все опубликованные кейсы, без пагинации — только slug/title/updatedAt.
   * Для sitemap.xml и человекочитаемой карты сайта, не для обычных списков
   * на сайте (там нужна пагинация — см. findListPublishedCaseMainInfo ниже).
   */
  async findAllPublishedSitemapItems(): Promise<ContentSitemapItemDto[]> {
    return this.repository.repository
      .createQueryBuilder('cases')
      .select('cases.slug', 'slug')
      .addSelect('cases.title', 'title')
      .addSelect('cases.updatedAt', 'updatedAt')
      .where('cases.datePublished IS NOT NULL')
      .andWhere('cases.datePublished <= :now', { now: new Date() })
      .orderBy('cases.datePublished', 'DESC')
      .getRawMany();
  }

  /** Публичный эндпоинт сайта — список опубликованных кейсов с пагинацией */
  async findListPublishedCaseMainInfo(
    query: ContentListQueryDto,
  ): Promise<AdminPaginatedResponse<Case>> {
    const { page, limit, search, sortBy, authorSlug, tagSlug } = query;
    const sort = sortBy ? CASE_SORT_MAP[sortBy] : CASE_SORT_MAP[SortByDate.PUBLISHED_DESC];

    const qb = this.repository.repository
      .createQueryBuilder('cases')
      .leftJoin('cases.authors', 'author')
      .leftJoin('cases.tags', 'tag')
      .select([...CASES_MAIN_FIELDS])
      .addSelect([...EMPLOYEE_SHORT_FIELDS])
      .addSelect([...TAG_SHORT_FIELDS])
      .where('cases.datePublished IS NOT NULL')
      .andWhere('cases.datePublished <= :now', { now: new Date() })
      .orderBy('cases.priority', 'DESC')
      .addOrderBy(sort.column, sort.direction)
      .addOrderBy('cases.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere('cases.title ILIKE :search', { search: `%${search}%` });
    }
    this.applyAuthorSlugFilter(qb, authorSlug);
    this.applyTagSlugFilter(qb, tagSlug);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Фильтр «только материалы этого автора» — отдельный подзапрос, не условие
   * на join-алиасе `author` (см. findListCaseMainInfo). Иначе у кейсов
   * с несколькими соавторами из результата пропадут все совпавшие строки,
   * кроме автора-фильтра — join используется только для подгрузки ПОЛНОГО
   * списка авторов, не для фильтрации.
   */
  private applyAuthorSlugFilter(
    qb: SelectQueryBuilder<Case>,
    authorSlug?: string,
  ): void {
    if (!authorSlug) return;

    qb.andWhere((sub) => {
      const subQuery = sub
        .subQuery()
        .select('ca.case_id')
        .from('case_authors', 'ca')
        .innerJoin('employees', 'e', 'e.id = ca.employee_id')
        .where('e.slug = :authorSlug')
        .getQuery();
      return `cases.id IN ${subQuery}`;
    }).setParameter('authorSlug', authorSlug);
  }

  /** Фильтр «только материалы с этим тегом» — тот же приём подзапроса, что и у авторов. */
  private applyTagSlugFilter(
    qb: SelectQueryBuilder<Case>,
    tagSlug?: string,
  ): void {
    if (!tagSlug) return;

    qb.andWhere((sub) => {
      const subQuery = sub
        .subQuery()
        .select('ct.case_id')
        .from('case_tags', 'ct')
        .innerJoin('tags', 't', 't.id = ct.tag_id')
        .where('t.slug = :tagSlug')
        .getQuery();
      return `cases.id IN ${subQuery}`;
    }).setParameter('tagSlug', tagSlug);
  }

  /** Публичный эндпоинт сайта — только опубликованные, приоритетная сортировка */
  async getCasesByServiceSlug(slug: string): Promise<Case[]> {
    const service = await this.servicesService.findBySlug(slug);
    return this.repository.repository
      .createQueryBuilder('cases')
      .innerJoin('cases.services', 'service')
      .leftJoinAndSelect('cases.authors', 'author')
      .select([...CASES_MAIN_FIELDS])
      .addSelect([...EMPLOYEE_SHORT_FIELDS])
      .where('service.id = :id', { id: service.id })
      .andWhere('cases.datePublished IS NOT NULL')
      .andWhere('cases.datePublished <= :now', { now: new Date() })
      .orderBy('cases.priority', 'DESC')
      .addOrderBy('cases.datePublished', 'DESC')
      .addOrderBy('cases.id', 'DESC')
      .getMany();
  }

  /** Публичный эндпоинт сайта — только опубликованный кейс */
  async getCaseBySlug(slug: string): Promise<CaseRow> {
    const row = await this.fetchCaseRow(slug, true);

    if (!row) {
      throw new NotFoundException(`${this.getEntityName()} не найден`);
    }
    return this.attachFaq(await this.attachTags(await this.attachAuthors(row)));
  }

  /** Админ-эндпоинт — кейс по slug независимо от статуса публикации (черновики/отложенные) */
  async getCaseBySlugAdmin(slug: string): Promise<CaseRow> {
    const row = await this.fetchCaseRow(slug, false);

    if (!row) {
      throw new NotFoundException(`${this.getEntityName()} не найден`);
    }
    return this.attachFaq(await this.attachTags(await this.attachAuthors(row)));
  }

  private async fetchCaseRow(slug: string, publishedOnly: boolean): Promise<CaseRow | undefined> {
    const qb = this.repository.repository
      .createQueryBuilder('cases')
      .leftJoin('service_to_case', 'stc', 'stc.case_id = cases.id')
      .leftJoin('case_authors', 'ca', 'ca.case_id = cases.id')
      .leftJoin('case_tags', 'ct', 'ct.case_id = cases.id')
      .select([
        'cases.id AS id',
        'cases.slug AS slug',
        'cases.title AS title',
        'cases.industry AS industry',
        'cases.description AS description',
        'cases.problem AS problem',
        'cases.result AS result',
        'cases.content AS content',
        'cases.contentHtml AS "contentHtml"',
        'cases.metaTitle AS "metaTitle"',
        'cases.metaDescription AS "metaDescription"',
        'cases.keywords AS "keywords"',
        'cases.date_published AS "datePublished"',
        'cases.created_at AS "createdAt"',
        'cases.updated_at AS "updatedAt"',
      ])
      .addSelect(
        `COALESCE(array_agg(DISTINCT stc.service_id) FILTER (WHERE stc.service_id IS NOT NULL), '{}')`,
        'serviceIds',
      )
      .addSelect(
        `COALESCE(array_agg(DISTINCT ca.employee_id) FILTER (WHERE ca.employee_id IS NOT NULL), '{}')`,
        'authorIds',
      )
      .addSelect(
        `COALESCE(array_agg(DISTINCT ct.tag_id) FILTER (WHERE ct.tag_id IS NOT NULL), '{}')`,
        'tagIds',
      )
      .where('cases.slug = :slug', { slug })
      .groupBy('cases.id');

    if (publishedOnly) {
      qb.andWhere('cases.datePublished IS NOT NULL').andWhere(
        'cases.datePublished <= :now',
        { now: new Date() },
      );
    }

    return qb.getRawOne<CaseRow>();
  }

  /** Лёгкая проекция авторов (id/slug/name/photoUrl/position/experience) — отдельный запрос, чтобы не трогать существующий raw-SQL контракт serviceIds. */
  private async attachAuthors(row: CaseRow): Promise<CaseRow> {
    if (!row.authorIds?.length) {
      return { ...row, authors: [] };
    }

    const authors = await this.repo.manager.getRepository(Employee).find({
      where: { id: In(row.authorIds) },
      select: ['id', 'slug', 'name', 'photoUrl', 'position', 'experience'],
    });

    return { ...row, authors };
  }

  /** Лёгкая проекция тегов — отдельный запрос, тот же приём, что и attachAuthors. */
  private async attachTags(row: CaseRow): Promise<CaseRow> {
    if (!row.tagIds?.length) {
      return { ...row, tags: [] };
    }

    const tags = await this.repo.manager.getRepository(Tag).find({
      where: { id: In(row.tagIds) },
      select: ['id', 'slug', 'name'],
    });

    return { ...row, tags };
  }

  /** Подгружает FAQ кейса, отсортированный по orderIndex — отдельный запрос, тот же приём, что и attachAuthors/attachTags. */
  private async attachFaq(row: CaseRow): Promise<CaseRow> {
    const faq = await this.repo.manager.getRepository(CaseFaq).find({
      where: { caseId: row.id },
      select: ['id', 'question', 'answer'],
      order: { orderIndex: 'ASC' },
    });

    return { ...row, faq };
  }

  /** Похожие кейсы по совпадению тегов — блок «Похожие кейсы» на странице статьи/кейса. */
  async findSimilarPublished(
    tagIds: number[],
    excludeId: number | undefined,
    limit = 6,
  ): Promise<Case[]> {
    if (!tagIds.length) return [];

    const rankedQb = this.repository.repository
      .createQueryBuilder('cases')
      .innerJoin('case_tags', 'ct', 'ct.case_id = cases.id')
      .select('cases.id', 'id')
      .addSelect('COUNT(DISTINCT ct.tag_id)', 'matched')
      .where('ct.tag_id IN (:...tagIds)', { tagIds })
      .andWhere('cases.datePublished IS NOT NULL')
      .andWhere('cases.datePublished <= :now', { now: new Date() })
      .groupBy('cases.id')
      .orderBy('matched', 'DESC')
      .addOrderBy('cases.priority', 'DESC')
      .addOrderBy('cases.datePublished', 'DESC')
      .limit(limit);

    if (excludeId) {
      rankedQb.andWhere('cases.id != :excludeId', { excludeId });
    }

    const ranked = await rankedQb.getRawMany<{ id: number }>();
    const ids = ranked.map((r) => r.id);
    if (!ids.length) return [];

    const items = await this.repository.repository
      .createQueryBuilder('cases')
      .leftJoin('cases.authors', 'author')
      .leftJoin('cases.tags', 'tag')
      .select([...CASES_MAIN_FIELDS])
      .addSelect([...EMPLOYEE_SHORT_FIELDS])
      .addSelect([...TAG_SHORT_FIELDS])
      .where('cases.id IN (:...ids)', { ids })
      .getMany();

    const order = new Map(ids.map((id, idx) => [id, idx]));
    return items.sort((a, b) => order.get(a.id)! - order.get(b.id)!);
  }

  async remove(id: number): Promise<void> {
    const caseEntity = await this.findOneOrFail({ where: { id } });

    await this.repository.delete(id);

    await this.searchIndexService.deleteDocument(`caseEntity_${caseEntity.id}`);
  }
}
