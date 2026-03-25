import { Injectable, Logger } from '@nestjs/common';
import { SearchIndexService } from './search-index.service';
import { GlobalSearchDocument } from '../interfaces/global-search-document.interface';
import { ReindexResult } from '../interfaces/reindex-result.interface';
import { SearchDocumentBuilder } from '../interfaces/search-document-builder.interface';
import { SearchReindexBatchLoader } from '../interfaces/search-reindex-batch-loader.interface';

interface ReindexEntitiesParams<TEntity extends { id: number }> {
  entityName: string;
  batchLoader: SearchReindexBatchLoader<TEntity>;
  documentBuilder: SearchDocumentBuilder<TEntity>;
  batchSize?: number;
}

@Injectable()
export class SearchReindexExecutorService {
  private readonly logger = new Logger(SearchReindexExecutorService.name);
  private readonly defaultBatchSize = 100;

  constructor(private readonly searchIndexService: SearchIndexService) {}

  async reindexEntities<TEntity extends { id: number }>(
    params: ReindexEntitiesParams<TEntity>,
  ): Promise<ReindexResult> {
    const batchSize = params.batchSize ?? this.defaultBatchSize;

    let lastId = 0;
    let processed = 0;
    let indexed = 0;
    let failed = 0;

    while (true) {
      const entities = await params.batchLoader.findBatchAfterId(
        lastId,
        batchSize,
      );

      if (entities.length === 0) {
        break;
      }

      const documents: GlobalSearchDocument[] = [];

      for (const entity of entities) {
        processed += 1;
        lastId = entity.id;

        try {
          const document = params.documentBuilder.build(entity);
          documents.push(document);
        } catch (error: unknown) {
          failed += 1;

          const errorMessage =
            error instanceof Error ? error.message : String(error);

          this.logger.error(
            `Failed to build search document for ${params.entityName} id=${entity.id}: ${errorMessage}`,
            error instanceof Error ? error.stack : undefined,
          );
        }
      }

      if (documents.length > 0) {
        await this.searchIndexService.upsertDocuments(documents);
        indexed += documents.length;
      }

      this.logger.log(
        `[${params.entityName}] Reindex progress: processed=${processed}, indexed=${indexed}, failed=${failed}, lastId=${lastId}`,
      );
    }

    this.logger.log(
      `[${params.entityName}] Reindex completed: processed=${processed}, indexed=${indexed}, failed=${failed}`,
    );

    return {
      processed,
      indexed,
      failed,
    };
  }
}
