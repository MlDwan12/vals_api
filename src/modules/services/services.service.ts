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
  CATEGORY_FIELDS,
  FAQ_FIELDS,
  SERVICE_BASE_FIELDS,
  SERVICE_MAIN_FIELDS,
  STAGE_FIELDS,
  TARIFF_FIELDS,
} from './queries/service.selects';

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

  async findListServiceMainInfo(): Promise<Service[]> {
    return this.repository.repository
      .createQueryBuilder('service')
      .select([...SERVICE_MAIN_FIELDS])
      .orderBy('service.id', 'ASC')
      .getMany();
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
      .leftJoin('service.tariffs', 'tariffs')
      .leftJoin('service.faq', 'faq')
      .select([
        ...SERVICE_BASE_FIELDS,
        ...CATEGORY_FIELDS,
        ...STAGE_FIELDS,
        ...TARIFF_FIELDS,
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
    return entity;
  }
}
