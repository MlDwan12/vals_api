import { Controller, DynamicModule, Inject, Type } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseCrudRepository } from './base.repository';
import { BaseCrudService } from './base.service';
import { BaseCrudController } from './base.controller';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PinoLogger } from 'nestjs-pino';

export interface CrudModuleOptions<Entity extends { id: number }> {
  entity: Type<Entity>;
  dto?: {
    create?: Type<any>;
    update?: Type<any>;
  };
  path?: string; // префикс роутов, по умолчанию pluralized entity name
  tags?: string[]; // теги для swagger
  auth?: boolean; // добавлять @ApiBearerAuth() ко всем методам
}

export interface CrudModuleReturn<Entity extends { id: number }> {
  forRoot: () => DynamicModule;
  REPOSITORY_TOKEN: string;
  SERVICE_TOKEN: string;
  CONTROLLER: Type<BaseCrudController<Entity, any, any>>;
}

/**
 * Создаёт полноценный CRUD-модуль (репозиторий + сервис + контроллер)
 * Использование: imports: [CrudModule<User>({ entity: User, ... }).forRoot()]
 */
export function CrudModule<Entity extends { id: number }>(
  options: CrudModuleOptions<Entity>,
): CrudModuleReturn<Entity> {
  const { entity, path, tags = [], auth = false } = options;

  const entityName = entity.name;
  const pluralName = `${entityName.toLowerCase()}s`;
  const controllerPath = path || pluralName;

  const REPOSITORY_TOKEN = `${entityName}CrudRepository`;
  const SERVICE_TOKEN = `${entityName}CrudService`;

  // 1. Репозиторий
  class EntityRepository extends BaseCrudRepository<Entity> {
    constructor(repo: Repository<Entity>) {
      super(repo, entity);
    }
  }

  // 2. Сервис
  class EntityService extends BaseCrudService<Entity, any, any> {
    protected readonly repository: EntityRepository;

    constructor(repository: EntityRepository, logger: PinoLogger) {
      super(logger);
      this.repository = repository;
    }
  }

  // 3. Контроллер
  @Controller(controllerPath)
  class EntityController extends BaseCrudController<Entity, any, any> {
    protected readonly entityName = entityName;

    constructor(
      @Inject(SERVICE_TOKEN)
      service: BaseCrudService<Entity, any, any>,
    ) {
      super(service);
    }
  }

  // Декораторы Swagger (применяем сразу к классу контроллера)
  if (tags.length > 0) {
    ApiTags(...tags)(EntityController);
  }
  if (auth) {
    ApiBearerAuth()(EntityController);
  }

  // 4. Внутренний модуль (без @Module, чтобы не создавать лишний класс)
  const dynamicModule: DynamicModule = {
    module: class {},
    imports: [TypeOrmModule.forFeature([entity])],
    providers: [
      {
        provide: REPOSITORY_TOKEN,
        useFactory: (repo: Repository<Entity>) => new EntityRepository(repo),
        inject: [getRepositoryToken(entity)],
      },
      {
        provide: SERVICE_TOKEN,
        useFactory: (repository: EntityRepository, logger: PinoLogger) =>
          new EntityService(repository, logger),
        inject: [REPOSITORY_TOKEN, PinoLogger],
      },
    ],
    controllers: [EntityController],
    exports: [REPOSITORY_TOKEN, SERVICE_TOKEN], // ✅ экспортируем токены
  };

  // Возвращаем объект с методом forRoot (или просто сам dynamicModule)
  return {
    forRoot: () => dynamicModule,
    REPOSITORY_TOKEN,
    SERVICE_TOKEN,
    CONTROLLER: EntityController, // если нужен
  };
}
