export const createRepositoryTokens = (entityName: string) => ({
  COMMAND: Symbol(`${entityName}_COMMAND_REPOSITORY`),
  QUERY: Symbol(`${entityName}_QUERY_REPOSITORY`),
});
