import { Injectable, NotFoundException } from '@nestjs/common';
import { Service } from './entities/service.entity';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PinoLogger } from 'nestjs-pino';
import { BaseCrudService } from 'src/core/crud/base.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceRepository } from './service.repository';
import { Repository } from 'typeorm';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceCategoriesService } from '../service_categories/service_categories.service';
import { ServiceCategory } from '../service_categories/entities/service_category.entity';
import {
  CASES_MAIN_FIELDS,
  CATEGORY_FIELDS,
  FAQ_FIELDS,
  SERVICE_BASE_FIELDS,
  SERVICE_MAIN_FIELDS,
  STAGE_FIELDS,
  TARIFF_FIELDS,
} from './queries/service.selects';
import { ServiceSearchDocumentBuilder } from '../search/builders/service-search-document.builder';
import { SearchIndexService } from '../search/services/search-index.service';
import { AdminListQueryDto } from 'src/shared/dto/admin-list-query.dto';
import { SortByDate } from 'src/shared/enums/sort-by-date.enum';
import { AdminPaginatedResponse } from 'src/core/crud/interfaces/pagination.interface';

@Injectable()
export class ServicesService extends BaseCrudService<
  Service,
  CreateServiceDto,
  UpdateServiceDto
> {
  protected repository: BaseCrudRepository<Service>;
  constructor(
    @InjectRepository(Service) private readonly repo: Repository<Service>,
    protected readonly logger: PinoLogger,
    private readonly serviceCategoryService: ServiceCategoriesService,
    private readonly serviceSearchDocumentBuilder: ServiceSearchDocumentBuilder,
    private readonly searchIndexService: SearchIndexService,
  ) {
    super(logger);
    this.repository = new ServiceRepository(this.repo);
  }

  async findAllWithRelations(): Promise<Service[]> {
    return this.repository.findMany({
      relations: {
        category: true,
        tariffs: true,
        faq: true,
        stages: true,
      },
      order: {
        id: 'ASC',
        stages: {
          step: 'ASC',
        },
      },
    });
  }

  async findListServiceShortInfo(): Promise<Service[]> {
    return this.repository.repository
      .createQueryBuilder('service')
      .leftJoin('service.category', 'category')
      .select([...SERVICE_BASE_FIELDS, ...CATEGORY_FIELDS])
      .orderBy('service.id', 'ASC')
      .getMany();
  }

  async findListServiceMainInfo(
    query: AdminListQueryDto,
  ): Promise<AdminPaginatedResponse<Service>> {
    const { page, limit, search, sortBy } = query;

    const sortMap: Record<SortByDate, { column: string; direction: 'ASC' | 'DESC' }> = {
      [SortByDate.UPDATED_DESC]:   { column: 'service.updatedAt', direction: 'DESC' },
      [SortByDate.UPDATED_ASC]:    { column: 'service.updatedAt', direction: 'ASC'  },
      [SortByDate.CREATED_DESC]:   { column: 'service.createdAt', direction: 'DESC' },
      [SortByDate.CREATED_ASC]:    { column: 'service.createdAt', direction: 'ASC'  },
      [SortByDate.PUBLISHED_DESC]: { column: 'service.createdAt', direction: 'DESC' },
      [SortByDate.PUBLISHED_ASC]:  { column: 'service.createdAt', direction: 'ASC'  },
    };

    const sort = sortBy ? sortMap[sortBy] : sortMap[SortByDate.CREATED_DESC];

    const qb = this.repository.repository
      .createQueryBuilder('service')
      .select([...SERVICE_MAIN_FIELDS])
      .orderBy(sort.column, sort.direction)
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.where('service.title ILIKE :search', { search: `%${search}%` });
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findListServiceFullInfo(): Promise<Service[]> {
    return this.repository.repository
      .createQueryBuilder('service')
      .leftJoin('service.category', 'category')
      .leftJoin('service.stages', 'stage')
      .leftJoin('service.tariffs', 'tariffs')
      .leftJoin('service.faq', 'faq')
      .select([
        ...SERVICE_BASE_FIELDS,
        ...CATEGORY_FIELDS,
        ...STAGE_FIELDS,
        ...TARIFF_FIELDS,
        ...FAQ_FIELDS,
      ])
      .orderBy('service.id', 'ASC')
      .addOrderBy('stage.step', 'ASC')
      .getMany();
  }

  async findOneByIDWithRelations(slug: string): Promise<Service | null> {
    const service = await this.repository.repository
      .createQueryBuilder('service')
      .leftJoin('service.category', 'category')
      .leftJoin('service.stages', 'stage')
      .leftJoin(
        'service.cases',
        'cases',
        'cases.datePublished IS NOT NULL AND cases.datePublished <= :now',
        { now: new Date() },
      )
      .leftJoin('service.tariffs', 'tariffs')
      .leftJoin('service.faq', 'faq')
      .select([
        ...SERVICE_BASE_FIELDS,
        ...CATEGORY_FIELDS,
        ...STAGE_FIELDS,
        ...TARIFF_FIELDS,
        ...CASES_MAIN_FIELDS,
        ...FAQ_FIELDS,
      ])
      .where('service.slug = :slug', { slug })
      .orderBy('service.id', 'ASC')
      .addOrderBy('stage.step', 'ASC')
      .addOrderBy('tariffs.order_index', 'ASC')
      .getOne();

    if (!service) {
      throw new NotFoundException(`Service with slug ${slug} not found`);
    }

    return service;
  }

  async findBySlug(slug: string): Promise<Service> {
    const service = await this.repository.findOne({ where: { slug } });
    if (!service) throw new NotFoundException();
    return service;
  }

  getListServicesWithFaq(): Promise<Service[]> {
    return this.repository.repository
      .createQueryBuilder('service')
      .leftJoin('service.faq', 'faq')
      .leftJoin('service.category', 'category')
      .select([...SERVICE_BASE_FIELDS, ...CATEGORY_FIELDS, ...FAQ_FIELDS])
      .orderBy('service.id', 'ASC')
      .getMany();
  }

  async create(dto: CreateServiceDto): Promise<Service> {
    const { categoryId, ...rest } = dto;
    let category: ServiceCategory = new ServiceCategory();

    if (categoryId) {
      category = await this.serviceCategoryService.findById(categoryId);
    }

    const entity = await this.repository.create({
      ...rest,
      category,
    });

    await this.searchIndexService.upsertDocument(
      this.serviceSearchDocumentBuilder.build(entity),
    );
    return entity;
  }

  async update(id: number, updateDto: UpdateServiceDto): Promise<Service> {
    const service = await this.repository.update(id, updateDto);

    await this.searchIndexService.upsertDocument(
      this.serviceSearchDocumentBuilder.build(service!),
    );

    return service!;
  }

  async remove(id: number): Promise<void> {
    const service = await this.findOneOrFail({ where: { id } });

    await this.repository.delete(id);

    await this.searchIndexService.deleteDocument(`service_${service.id}`);
  }
}
