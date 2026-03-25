import { Injectable } from '@nestjs/common';
import { SearchQueryDto } from '../dto/search-query.dto';
import { SearchResultDto, SearchResultItemDto } from '../dto/search-result.dto';
import { GlobalSearchDocument } from '../interfaces/global-search-document.interface';
import { MeilisearchService } from './meiliserch.service';
import {
  SEARCH_DEFAULT_LIMIT,
  SEARCH_MAX_LIMIT,
} from '../constants/search.constant';

@Injectable()
export class SearchService {
  constructor(private readonly meilisearchService: MeilisearchService) {}

  async search(dto: SearchQueryDto): Promise<SearchResultDto> {
    const query = dto.q.trim();
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? SEARCH_DEFAULT_LIMIT, SEARCH_MAX_LIMIT);
    const offset = (page - 1) * limit;

    const index = this.meilisearchService.getIndex();

    const response = await index.search<GlobalSearchDocument>(query, {
      limit,
      offset,
    });

    const items: SearchResultItemDto[] = response.hits.map(
      (hit: GlobalSearchDocument) => ({
        id: hit.id,
        entityType: hit.entityType,
        // entityId: hit.entityId,
        title: hit.title,
        // slug: hit.slug,
        description: hit.description,
        // tags: hit.tags,
        url: hit.url,
        // category: hit.category,
      }),
    );

    const total = response.estimatedTotalHits ?? items.length;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    return {
      query,
      total,
      page,
      limit,
      totalPages,
      items,
    };
  }
}
