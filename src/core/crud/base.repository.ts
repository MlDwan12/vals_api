import {
  DeepPartial,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import {
  PaginationOptions,
  PaginationResult,
} from './interfaces/pagination.interface';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';

export abstract class BaseCrudRepository<T extends { id: number }> {
  constructor(
    protected readonly repo: Repository<T>,
    protected readonly entity: new () => T,
  ) {}

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async createMany(data: DeepPartial<T>[], chunkSize = 100): Promise<T[]> {
    return this.repo.manager.transaction(async (em) => {
      const chunks = this.chunkArray(data, chunkSize);
      const result: T[] = [];
      for (const chunk of chunks) {
        const entities = this.repo.create(chunk);
        result.push(...(await em.save(entities)));
      }
      return result;
    });
  }

  async findById(
    id: T['id'],
    options?: Omit<FindOneOptions<T>, 'where'>,
  ): Promise<T | null> {
    return this.repo.findOne({
      where: { id } as FindOptionsWhere<T>,
      ...options,
    });
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repo.findOne(options);
  }

  async findMany(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repo.find(options);
  }

  async findByIds(ids: T['id'][]): Promise<T[]> {
    if (!ids.length) return [];
    return this.repo.find({ where: { id: In(ids) } as FindOptionsWhere<T> });
  }

  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    return (await this.repo.count({ where, take: 1 })) > 0;
  }

  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return this.repo.count({ where });
  }

  async paginate(
    options: FindManyOptions<T> = {},
    pagination: PaginationOptions,
  ): Promise<PaginationResult<T>> {
    const page = pagination.page ?? 1;
    const limit = Math.min(pagination.limit ?? 20, 500);

    const order = options.order ?? ({ id: 'DESC' } as FindOptionsOrder<T>);

    const [data, total] = await this.repo.findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
      order,
    });

    return { data, total, page, limit };
  }

  async update(
    id: T['id'],
    data: QueryDeepPartialEntity<T>,
  ): Promise<T | null> {
    const { affected } = await this.repo.update(id, data);
    if (affected === 0) return null;
    return this.findById(id);
  }

  async updateWhere(
    where: FindOptionsWhere<T>,
    data: QueryDeepPartialEntity<T>,
  ): Promise<number> {
    const { affected } = await this.repo.update(where, data);
    return affected ?? 0;
  }

  async delete(id: T['id']): Promise<boolean> {
    const { affected } = await this.repo.delete(id);
    return (affected ?? 0) > 0;
  }

  async deleteWhere(where: FindOptionsWhere<T>): Promise<number> {
    const { affected } = await this.repo.delete(where);
    return affected ?? 0;
  }

  async transaction<R>(fn: (em: EntityManager) => Promise<R>): Promise<R> {
    return this.repo.manager.transaction(fn);
  }

  get orm(): Repository<T> {
    return this.repo;
  }

  get repository(): Repository<T> {
    return this.repo;
  }

  private chunkArray<U>(array: U[], size: number): U[][] {
    const result: U[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }
}
