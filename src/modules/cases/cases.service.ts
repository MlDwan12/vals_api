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
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from '../services/entities/service.entity';
import {
  CASES_MAIN_FIELDS,
  SERVICE_BASE_FIELDS,
} from '../services/queries/service.selects';
import { ServicesService } from '../services/services.service';

type CaseRow = {
  id: number;
  slug: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  serviceIds: number[];
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
  ) {
    super(logger);
    this.repository = new CaseRepository(this.repo);
  }

  public async create(dto: CreateCaseDto): Promise<Case> {
    const serviceIds = this.normalizeIds(dto.serviceIds);

    return this.repository.transaction(async (em) => {
      const services = await em.getRepository(Service).find({
        where: { id: In(serviceIds) },
        select: ['id'],
      });

      this.assertAllServicesFound(
        serviceIds,
        services.map((s) => s.id),
      );
      console.log('dto=================>', dto);

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
        services,
      });

      console.log('entity=============>', entity);

      const saved = await em.getRepository(Case).save(entity);

      return em.getRepository(Case).findOneOrFail({
        where: { id: saved.id },
        relations: { services: true },
      });
    });
  }

  // ✅ update с M2M (НЕ через repo.update)
  public async update(id: number, dto: UpdateCaseDto): Promise<Case> {
    return this.repository.transaction(async (em) => {
      const caseRepo = em.getRepository(Case);

      const existing = await caseRepo.findOne({
        where: { id },
        relations: { services: true },
      });

      if (!existing) {
        throw new NotFoundException(`Case ${id} not found`);
      }

      // связи
      if (dto.serviceIds) {
        const serviceIds = this.normalizeIds(dto.serviceIds);

        const services = await em.getRepository(Service).find({
          where: { id: In(serviceIds) },
          select: ['id'],
        });

        this.assertAllServicesFound(
          serviceIds,
          services.map((s) => s.id),
        );
        existing.services = services;
      }
      console.log('dto.contentHtml==========>', dto.contentHtml);

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

      await caseRepo.save(existing);

      return caseRepo.findOneOrFail({
        where: { id },
        relations: { services: true },
      });
    });
  }

  private normalizeIds(ids: number[]): number[] {
    const uniq = Array.from(new Set(ids));
    if (uniq.length === 0) {
      throw new BadRequestException('serviceIds must not be empty');
    }
    return uniq;
  }

  private assertAllServicesFound(requested: number[], found: number[]): void {
    if (found.length === requested.length) return;

    const foundSet = new Set(found);
    const missing = requested.filter((id) => !foundSet.has(id));

    throw new BadRequestException(`Services not found: ${missing.join(', ')}`);
  }

  async findListCaseMainInfo(): Promise<Case[]> {
    return this.repository.repository
      .createQueryBuilder('cases')
      .select([...CASES_MAIN_FIELDS])
      .orderBy('cases.updatedAt', 'DESC')
      .getMany();
  }

  async getCasesByServiceSlug(slug: string): Promise<Case[]> {
    const service = await this.servicesService.findBySlug(slug);
    return this.repository.repository
      .createQueryBuilder('cases')
      .innerJoin('cases.services', 'service')
      .select([...CASES_MAIN_FIELDS])
      .where('service.id = :id', { id: service.id })
      .orderBy('cases.updatedAt', 'DESC')
      .getMany();
  }

  async getCaseBySlug(slug: string): Promise<CaseRow> {
    const row = await this.repository.repository
      .createQueryBuilder('cases')
      .leftJoin('service_to_case', 'stc', 'stc.case_id = cases.id')
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
        'cases.created_at AS "createdAt"',
        'cases.updated_at AS "updatedAt"',
      ])
      .addSelect(
        `COALESCE(array_agg(stc.service_id) FILTER (WHERE stc.service_id IS NOT NULL), '{}')`,
        'serviceIds',
      )
      .where('cases.slug = :slug', { slug })
      .groupBy('cases.id')
      .getRawOne();

    if (!row) {
      throw new NotFoundException(`${this.getEntityName()} not found`);
    }
    return row;
  }
}
