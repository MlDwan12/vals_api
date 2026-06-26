export class ArticleStatsDto {
  total: number;
  published: number;
}

export class CaseStatsDto {
  total: number;
  published: number;
}

export class ServiceStatsDto {
  total: number;
}

export class ClientStatsDto {
  total: number;
  totalLeads: number;
}

export class DashboardStatsDto {
  articles: ArticleStatsDto;
  cases: CaseStatsDto;
  services: ServiceStatsDto;
  clients: ClientStatsDto;
}
