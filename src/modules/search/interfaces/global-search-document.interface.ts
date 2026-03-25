import { SearchEntityType } from './searchable-entity-type.type';

export interface GlobalSearchDocument {
  id: string;
  entityType: SearchEntityType;
  entityId: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string | null;
  tags: string[];
  url: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
