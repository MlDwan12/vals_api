import { Injectable } from '@nestjs/common';
import { GlobalSearchDocument } from '../interfaces/global-search-document.interface';
import { MeilisearchService } from './meiliserch.service';

@Injectable()
export class SearchIndexService {
  constructor(private readonly meilisearchService: MeilisearchService) {}

  async upsertDocument(document: GlobalSearchDocument): Promise<void> {
    const index = this.meilisearchService.getIndex();
    await index.addDocuments([document]);
  }

  async upsertDocuments(documents: GlobalSearchDocument[]): Promise<void> {
    if (documents.length === 0) {
      return;
    }

    const index = this.meilisearchService.getIndex();
    await index.addDocuments(documents);
  }

  async deleteDocument(documentId: string): Promise<void> {
    const index = this.meilisearchService.getIndex();
    await index.deleteDocument(documentId);
  }

  async deleteDocuments(documentIds: string[]): Promise<void> {
    if (documentIds.length === 0) {
      return;
    }

    const index = this.meilisearchService.getIndex();
    await index.deleteDocuments(documentIds);
  }
}
