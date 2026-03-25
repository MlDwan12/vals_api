import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Index, MeiliSearch } from 'meilisearch';
import { GlobalSearchDocument } from '../interfaces/global-search-document.interface';
import {
  SEARCH_HOST_CONFIG_KEY,
  SEARCH_MASTER_KEY_CONFIG_KEY,
  SEARCH_INDEX_NAME_CONFIG_KEY,
} from '../constants/search.constant';

@Injectable()
export class MeilisearchService implements OnModuleInit {
  private readonly client: MeiliSearch;
  private readonly indexName: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.getOrThrow<string>(SEARCH_HOST_CONFIG_KEY);
    const apiKey = this.configService.getOrThrow<string>(
      SEARCH_MASTER_KEY_CONFIG_KEY,
    );

    this.indexName = this.configService.getOrThrow<string>(
      SEARCH_INDEX_NAME_CONFIG_KEY,
    );

    this.client = new MeiliSearch({
      host,
      apiKey,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.ensureIndex();
  }

  getIndex(): Index<GlobalSearchDocument> {
    return this.client.index<GlobalSearchDocument>(this.indexName);
  }

  async ensureIndex(): Promise<void> {
    try {
      await this.client.createIndex(this.indexName, { primaryKey: 'id' });
    } catch {
      // индекс уже может существовать, это не фатальная ошибка
    }

    const index = this.getIndex();

    await index.updateSearchableAttributes([
      'title',
      'description',
      'content',
      'tags',
      'category',
    ]);

    await index.updateFilterableAttributes([
      'entityType',
      'isPublished',
      'category',
    ]);

    await index.updateSortableAttributes(['createdAt', 'updatedAt']);
  }
}
