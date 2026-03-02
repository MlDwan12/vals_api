import { DeepPartial, FindManyOptions, FindOneOptions } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';
import { BaseCrudRepository } from './base.repository';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  PaginationOptions,
  PaginationResult,
} from './interfaces/pagination.interface';
import { PinoLogger } from 'nestjs-pino';

export class EntityNotFoundError extends Error {
  constructor(entity: string, id: any) {
    super(`${entity} with id ${id} not found`);
  }
}

export abstract class BaseCrudService<
  Entity extends { id: number },
  CreateDto = DeepPartial<Entity>,
  UpdateDto = DeepPartial<Entity>,
> {
  protected abstract readonly repository: BaseCrudRepository<Entity>;

  constructor(@Inject(PinoLogger) protected readonly logger: PinoLogger) {}

  async create(createDto: CreateDto): Promise<Entity> {
    return this.repository.create(createDto as DeepPartial<Entity>);
  }

  async findById(id: number): Promise<Entity> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(
        `${this.getEntityName()} with ID ${id} not found`,
      );
    }
    return entity;
  }

  async findOneOrFail(options: FindOneOptions<Entity>): Promise<Entity> {
    const entity = await this.repository.findOne(options);
    if (!entity) {
      throw new NotFoundException(`${this.getEntityName()} not found`);
    }
    return entity;
  }

  async findAll(options?: FindManyOptions<Entity>): Promise<Entity[]> {
    return this.repository.findMany(options);
  }

  async findByIds(ids: number[]): Promise<Entity[]> {
    if (!ids?.length) return [];

    return this.repository.findByIds(ids);
  }

  async paginate(
    options: FindManyOptions<Entity> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<Entity>> {
    return this.repository.paginate(options, pagination);
  }

  async update(id: number, updateDto: UpdateDto): Promise<Entity> {
    const updated = await this.repository.update(
      id,
      updateDto as QueryDeepPartialEntity<Entity>,
    );
    if (!updated) {
      throw new NotFoundException(
        `${this.getEntityName()} with ID ${id} not found`,
      );
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundException(
        `${this.getEntityName()} with ID ${id} not found`,
      );
    }
  }

  protected getEntityName(): string {
    return this.repository['entity']?.name || 'Entity';
  }

  protected get repositoryAccess(): BaseCrudRepository<Entity> {
    return this.repository;
  }
}
