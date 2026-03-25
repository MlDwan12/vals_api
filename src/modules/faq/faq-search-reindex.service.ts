import { Injectable } from '@nestjs/common';
import { Faq } from './entities/faq.entity';
import { FaqRepository } from './faq.repository';
import { FaqSearchDocumentBuilder } from '../search/builders/faq-search-document.builder';
import { ReindexResult } from '../search/interfaces/reindex-result.interface';
import { SearchReindexExecutorService } from '../search/services/search-reindex.service';

@Injectable()
export class FaqSearchReindexService {
  constructor(
    private readonly faqRepository: FaqRepository,
    private readonly faqSearchDocumentBuilder: FaqSearchDocumentBuilder,
    private readonly searchReindexExecutorService: SearchReindexExecutorService,
  ) {}

  async reindex(): Promise<ReindexResult> {
    return this.searchReindexExecutorService.reindexEntities<Faq>({
      entityName: 'faq',
      batchLoader: this.faqRepository,
      documentBuilder: this.faqSearchDocumentBuilder,
      batchSize: 100,
    });
  }
}
