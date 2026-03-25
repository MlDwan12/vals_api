import { Injectable } from '@nestjs/common';
import { Service } from 'src/modules/services/entities/service.entity';
import { ReindexResult } from '../search/interfaces/reindex-result.interface';
import { ServiceSearchDocumentBuilder } from '../search/builders/service-search-document.builder';
import { SearchReindexExecutorService } from '../search/services/search-reindex.service';
import { ServiceRepository } from './service.repository';

@Injectable()
export class ServiceSearchReindexService {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly serviceSearchDocumentBuilder: ServiceSearchDocumentBuilder,
    private readonly searchReindexExecutorService: SearchReindexExecutorService,
  ) {}

  async reindex(): Promise<ReindexResult> {
    return this.searchReindexExecutorService.reindexEntities<Service>({
      entityName: 'service',
      batchLoader: this.serviceRepository,
      documentBuilder: this.serviceSearchDocumentBuilder,
    });
  }
}
