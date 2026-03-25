import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { Article } from './entities/article.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleRepository } from './articles.repository';
import { SearchModule } from '../search/search.module';
import { ArticleSearchReindexService } from './article-search-reindex.service';

@Module({
  imports: [TypeOrmModule.forFeature([Article]), SearchModule],
  controllers: [ArticlesController],
  providers: [ArticlesService, ArticleRepository, ArticleSearchReindexService],
  exports: [ArticleSearchReindexService, ArticleRepository],
})
export class ArticlesModule {}
