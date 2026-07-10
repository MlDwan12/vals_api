import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { Case } from './entities/case.entity';
import { CaseRepository } from './cases.repository';
import { PinoLogger } from 'nestjs-pino';
import { BaseCrudService } from 'src/core/crud/base.service';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from '../services/entities/service.entity';
import { CASES_MAIN_FIELDS } from '../services/queries/service.selects';
import { ServicesService } from '../services/services.service';
import { Employee } from '../employees/entities/employee.entity';
import { EmployeeShortDto } from '../employees/dto/employee-short.dto';
import { EMPLOYEE_SHORT_FIELDS } from '../employees/queries/employee.selects';
import { CaseSearchDocumentBuilder } from '../search/builders/case-search-document.builder';
import { SearchIndexService } from '../search/services/search-index.service';
import { ContentListQueryDto } from 'src/shared/dto/content-list-query.dto';
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
      });

      const saved = await em.getRepository(Case).save(entity);

      await this.searchIndexService.upsertDocument(
        this.caseSearchDocumentBuilder.build(saved),
      );
      return em.getRepository(Case).findOneOrFail({
        where: { id: saved.id },
        relations: { services: true, authors: true },
      });
    });
  }

  // ✅ update с M2M (НЕ через repo.update)
  public async update(id: number, dto: UpdateCaseDto): Promise<Case> {
    return this.repository.transaction(async (em) => {
      const caseRepo = em.getRepository(Case);

      const existing = await caseRepo.findOne({
        where: { id },
        relations: { services: true, authors: true },
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

      await this.searchIndexService.upsertDocument(
        this.caseSearchDocumentBuilder.build(
          await caseRepo.findOneOrFail({
            where: { id },
            relations: { services: true, authors: true },
          })!,
        ),
      );

      return caseRepo.findOneOrFail({
        where: { id },
        relations: { services: true, authors: true },
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

  private assertAllFound(entityLabel: string, requested: number[], found: number[]): void {
    if (found.length === requested.length) return;

    const foundSet = new Set(found);
    const missing = requested.filter((id) => !foundSet.has(id));

    throw new BadRequestException(`${entityLabel} не найдены: ${missing.join(', ')}`);
  }

  async findListCaseMainInfo(
    query: ContentListQueryDto,
  ): Promise<AdminPaginatedResponse<Case>> {
    const { page, limit, search, sortBy, authorSlug } = query;
    const sort = sortBy ? CASE_SORT_MAP[sortBy] : CASE_SORT_MAP[SortByDate.UPDATED_DESC];

    const qb = this.repository.repository
      .createQueryBuilder('cases')
      .leftJoin('cases.authors', 'author')
      .select([...CASES_MAIN_FIELDS])
      .addSelect([...EMPLOYEE_SHORT_FIELDS])
      .orderBy(sort.column, sort.direction)
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere('cases.title ILIKE :search', { search: `%${search}%` });
    }
    this.applyAuthorSlugFilter(qb, authorSlug);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** Публичный эндпоинт сайта — список опубликованных кейсов с пагинацией */
  async findListPublishedCaseMainInfo(
    query: ContentListQueryDto,
  ): Promise<AdminPaginatedResponse<Case>> {
    const { page, limit, search, sortBy, authorSlug } = query;
    const sort = sortBy ? CASE_SORT_MAP[sortBy] : CASE_SORT_MAP[SortByDate.PUBLISHED_DESC];

    const qb = this.repository.repository
      .createQueryBuilder('cases')
      .leftJoin('cases.authors', 'author')
      .select([...CASES_MAIN_FIELDS])
      .addSelect([...EMPLOYEE_SHORT_FIELDS])
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
    return this.attachAuthors(row);
  }

  /** Админ-эндпоинт — кейс по slug независимо от статуса публикации (черновики/отложенные) */
  async getCaseBySlugAdmin(slug: string): Promise<CaseRow> {
    const row = await this.fetchCaseRow(slug, false);

    if (!row) {
      throw new NotFoundException(`${this.getEntityName()} не найден`);
    }
    return this.attachAuthors(row);
  }

  private async fetchCaseRow(slug: string, publishedOnly: boolean): Promise<CaseRow | undefined> {
    const qb = this.repository.repository
      .createQueryBuilder('cases')
      .leftJoin('service_to_case', 'stc', 'stc.case_id = cases.id')
      .leftJoin('case_authors', 'ca', 'ca.case_id = cases.id')
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

  async remove(id: number): Promise<void> {
    const caseEntity = await this.findOneOrFail({ where: { id } });

    await this.repository.delete(id);

    await this.searchIndexService.deleteDocument(`caseEntity_${caseEntity.id}`);
  }
}
