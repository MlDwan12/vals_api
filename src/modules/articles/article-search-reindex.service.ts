import { Injectable } from '@nestjs/common';
import { ArticleRepository } from 'src/modules/articles/articles.repository';
import { Article } from 'src/modules/articles/entities/article.entity';
import { ArticleSearchDocumentBuilder } from '../search/builders/article-search-document.builder';
import { ReindexResult } from '../search/interfaces/reindex-result.interface';
import { SearchDocumentBuilder } from '../search/interfaces/search-document-builder.interface';
import { SearchReindexBatchLoader } from '../search/interfaces/search-reindex-batch-loader.interface';
import { SearchReindexExecutorService } from '../search/services/search-reindex.service';

@Injectable()
export class ArticleSearchReindexService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly articleSearchDocumentBuilder: ArticleSearchDocumentBuilder,
    private readonly searchReindexExecutorService: SearchReindexExecutorService,
  ) {}

  async reindex(): Promise<ReindexResult> {
    return this.searchReindexExecutorService.reindexEntities<Article>({
      entityName: 'article',
      batchLoader: this.articleRepository as SearchReindexBatchLoader<Article>,
      documentBuilder: this
        .articleSearchDocumentBuilder as SearchDocumentBuilder<Article>,
    });
  }
}
