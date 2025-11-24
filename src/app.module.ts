import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './core/config/app.config';
import databaseConfig from './core/config/database.config';
import loggerConfig from './core/config/logger.config';
import { LoggerModule } from 'nestjs-pino';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from './core/core.module';
import { BlogModule } from './modules/blog/blog.module';
import { CasesModule } from './modules/cases/cases.module';
import { CategoryModule } from './modules/category/category.module';
import { SubcategoryModule } from './modules/subcategory/subcategory.module';
import { CategoryBlogModule } from './modules/category_blog/category_blog.module';
import { KnowlageBaseModule } from './modules/knowlage_base/knowlage_base.module';
import { ServicesModule } from './modules/services/services.module';
import { SubcategoryBlogModule } from './modules/subcategory_blog/subcategory_blog.module';
import { DatabaseConfig } from './shared/types/config/db.config.type';
import { LoggerConfig } from './shared/types/config/logger.config.type';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, loggerConfig],
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
    CoreModule,
    BlogModule,
    CasesModule,
    CategoryModule,
    SubcategoryModule,
    CategoryBlogModule,
    KnowlageBaseModule,
    ServicesModule,
    SubcategoryBlogModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
