import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import loggerConfig from './config/logger.config';
import { LoggerModule } from 'nestjs-pino';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from './core/core.module';
import { DatabaseConfig } from './shared/types/config/db.config.type';
import { LoggerConfig } from './shared/types/config/logger.config.type';
import { FaqModule } from './modules/faq/faq.module';
import { IndustryModule } from './modules/industry/industry.module';

import bitrixConfig from './config/bitrix.config';
import mailConfig from './config/mail.config';
import { CasesModule } from './modules/cases/cases.module';
import { ServicesModule } from './modules/services/services.module';
import { ServiceCategoriesModule } from './modules/service_categories/service_categories.module';
import { ServiceStepsModule } from './modules/service_steps/service_steps.module';
import { TariffsModule } from './modules/tariffs/tariffs.module';
import { TariffPeriodsModule } from './modules/tariff_periods/tariff_periods.module';
import { UsersModule } from './modules/users/users.module';
import { BitrixModule } from './modules/bitrix/bitrix.module';
import { AuthModule } from './modules/auth/auth.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ImageLibModule } from './modules/image-lib/image-lib.module';
import { ClientModule } from './modules/client/client.module';
import securityConfig from './config/security.config';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        loggerConfig,
        bitrixConfig,
        mailConfig,
        securityConfig,
      ],
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = config.getOrThrow<LoggerConfig>('logger');

        return {
          pinoHttp: {
            level: logger.level,
            transport: logger.pretty
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    translateTime: logger.translateTime,
                  },
                }
              : undefined,
          },
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.getOrThrow<DatabaseConfig>('db');

        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads', // URL-префикс
      exclude: ['/docs*'], // чтобы не было конфликтов
      serveStaticOptions: {
        fallthrough: false, // fail-fast если файл не найден
        maxAge: '7d', // кеширование для статики
        immutable: true,
      },
    }),
    CoreModule,
    FaqModule,
    CasesModule,
    IndustryModule,
    ServicesModule,
    ServiceCategoriesModule,
    ServiceStepsModule,
    TariffsModule,
    TariffPeriodsModule,
    UsersModule,
    BitrixModule,
    AuthModule,
    ArticlesModule,
    ImageLibModule,
    ClientModule,
    SearchModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
