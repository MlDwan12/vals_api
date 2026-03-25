import { GlobalSearchDocument } from './global-search-document.interface';

export interface SearchDocumentBuilder<TEntity> {
  build(entity: TEntity): GlobalSearchDocument;
}
