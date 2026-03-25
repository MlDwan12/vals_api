export interface SearchReindexBatchLoader<TEntity> {
  findBatchAfterId(lastId: number, limit: number): Promise<TEntity[]>;
}
