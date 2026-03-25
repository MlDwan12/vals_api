import { Module } from '@nestjs/common';
import { SearchService } from './services/search.service';
import { SearchController } from './search.controller';
import { MeilisearchService } from './services/meiliserch.service';
import { SearchIndexService } from './services/search-index.service';
import { ArticleSearchDocumentBuilder } from './builders/article-search-document.builder';
import { ArticleSearchReindexService } from '../articles/article-search-reindex.service';
import { CaseSearchDocumentBuilder } from './builders/case-search-document.builder';
import { CaseSearchReindexService } from '../cases/case-search-reindex.service';
import { SearchReindexExecutorService } from './services/search-reindex.service';
import { FaqSearchDocumentBuilder } from './builders/faq-search-document.builder';
import { ServiceSearchDocumentBuilder } from './builders/service-search-document.builder';

@Module({
  controllers: [SearchController],
  providers: [
    SearchService,
    MeilisearchService,
    SearchIndexService,
    SearchReindexExecutorService,
    ArticleSearchDocumentBuilder,
    CaseSearchDocumentBuilder,
    FaqSearchDocumentBuilder,
    ServiceSearchDocumentBuilder,
  ],
  exports: [
    SearchService,
    MeilisearchService,
    SearchIndexService,
    SearchReindexExecutorService,
    ArticleSearchDocumentBuilder,
    CaseSearchDocumentBuilder,
    FaqSearchDocumentBuilder,
    ServiceSearchDocumentBuilder,
  ],
})
export class SearchModule {}
