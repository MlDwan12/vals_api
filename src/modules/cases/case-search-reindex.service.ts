import { Injectable } from '@nestjs/common';
import { Case } from 'src/modules/cases/entities/case.entity';
import { CaseSearchDocumentBuilder } from '../search/builders/case-search-document.builder';
import { ReindexResult } from '../search/interfaces/reindex-result.interface';
import { SearchDocumentBuilder } from '../search/interfaces/search-document-builder.interface';
import { SearchReindexBatchLoader } from '../search/interfaces/search-reindex-batch-loader.interface';
import { CaseRepository } from 'src/modules/cases/cases.repository';
import { SearchReindexExecutorService } from '../search/services/search-reindex.service';

@Injectable()
export class CaseSearchReindexService {
  constructor(
    private readonly caseRepository: CaseRepository,
    private readonly caseSearchDocumentBuilder: CaseSearchDocumentBuilder,
    private readonly searchReindexExecutorService: SearchReindexExecutorService,
  ) {}

  async reindex(): Promise<ReindexResult> {
    return this.searchReindexExecutorService.reindexEntities<Case>({
      entityName: 'case',
      batchLoader: this.caseRepository as SearchReindexBatchLoader<Case>,
      documentBuilder: this
        .caseSearchDocumentBuilder as SearchDocumentBuilder<Case>,
    });
  }
}
