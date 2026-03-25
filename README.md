## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Migration

```bash
# Создать новую миграцию
yarn migration:create src/database/migrations/Имя_миграции

# Запустить миграции
yarn migration:run

# Откатить последнюю миграцию
yarn migration:revert

# Показать список миграций
yarn migration:show
```

## Structure

src/
├── common/ # shared: pipes, guards, filters, decorators, utils
├── config/ # app config, validation
├── modules/ # ← здесь все фичи
│ ├── user/
│ │ ├── dto/ # входные/выходные данные
│ │ ├── entities/ # или models/ — доменные сущности / ORM-модели
│ │ ├── user.controller.ts # HTTP-эндпоинты
│ │ ├── user.service.ts # application/business логика
│ │ ├── user.module.ts # связывает всё внутри модуля + экспортирует нужное
│ │ └── user.repository.ts # если нужен кастомный репозиторий
│ ├── order/
│ ├── payment/
│ └── ... # каждая новая бизнес-фича → новая папка здесь
├── shared/ # shared-kernel: константы, базовые типы, общие сущности, исключения
├── app.module.ts # корневой модуль — собирает всё вместе
└── main.ts # точка входа (bootstrap)
