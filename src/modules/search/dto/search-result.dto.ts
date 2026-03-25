import { SearchEntityType } from '../interfaces/searchable-entity-type.type';

export interface SearchResultItemDto {
  id: string;
  entityType: SearchEntityType;
  entityId: number;
  title: string;
  slug: string;
  description: string;
  url: string;
  category: string | null;
}

export interface SearchResultDto {
  query: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  items: SearchResultItemDto[];
}
