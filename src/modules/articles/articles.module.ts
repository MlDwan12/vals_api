import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { ArticlesAdminController } from './articles-admin.controller';
import { Article } from './entities/article.entity';
import { ArticleFaq } from './entities/article-faq.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleRepository } from './articles.repository';
import { SearchModule } from '../search/search.module';
import { ArticleSearchReindexService } from './article-search-reindex.service';

@Module({
  imports: [TypeOrmModule.forFeature([Article, ArticleFaq]), SearchModule],
  controllers: [ArticlesController, ArticlesAdminController],
  providers: [ArticlesService, ArticleRepository, ArticleSearchReindexService],
  exports: [ArticleSearchReindexService, ArticleRepository],
})
export class ArticlesModule {}
