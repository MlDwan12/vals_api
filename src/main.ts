import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { GlobalValidationPipe } from './common/security/validation/validation.pipe';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // обязательно с nestjs-pino
  });
  const allowed = process.env.APP_CORS_ORIGINS!.split(',');
  const config = app.get(ConfigService);
  const logger = app.get(Logger);

  // Логгер
  app.useLogger(logger);

  // Базовая безопасность и перфоманс
  app.use(helmet()); // Helmet (можно заменить на наш HelmetGuard, если хочешь тонкую настройку CSP)
  app.use(cookieParser());
  app.use(compression());

  app.enableCors({
    origin: [...allowed],
    credentials: true,
  });

  // app.setGlobalPrefix('api');

  // УДАЛИЛ встроенный ValidationPipe — оставляем только наш крутой
  app.useGlobalPipes(new GlobalValidationPipe());

  // Глобальный фильтр исключений
  app.useGlobalFilters(new AllExceptionsFilter()); // передай logger, если хочешь логировать

  // 1. Создаём OpenAPI-документ (как раньше)

  // Вариант 1: Самый стабильный — экспорт JSON + url в Scalar (рекомендую)
  const configSwagger = new DocumentBuilder()
    .setTitle('Vals API')
    .setDescription('API для проекта Vals')
    .setVersion('1.0')
    // .addBearerAuth()           // раскомментируй, если есть JWT
    // .addTag('users', 'Пользователи')
    // .addTag('auth', 'Авторизация')
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);

  SwaggerModule.setup(
    'docs', // путь будет http://localhost:3000/docs
    app,
    document,
    {
      swaggerOptions: {
        persistAuthorization: true, // токен не теряется при перезагрузке страницы
        docExpansion: 'none', // сворачивает все эндпоинты по умолчанию
        tagsSorter: 'alpha', // сортировка тегов по алфавиту
        operationsSorter: 'alpha', // сортировка методов внутри тега
      },
      customCss: `
        .swagger-ui .topbar { background-color: #2d3748; }
        .swagger-ui .topbar .download-url-wrapper { display: none; }
      `,
    },
  );

  const port = config.getOrThrow<number>('app.port');
  const host = config.get<string>('app.host', '0.0.0.0');

  await app.listen(port, host);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(
    `API Reference (Scalar):     http://localhost:${process.env.PORT ?? 3000}/docs`,
  );
}

void bootstrap();
