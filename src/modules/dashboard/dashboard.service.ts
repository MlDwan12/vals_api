import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, LessThanOrEqual, Not, IsNull, Repository } from 'typeorm';
import { Article } from '../articles/entities/article.entity';
import { Case } from '../cases/entities/case.entity';
import { Service } from '../services/entities/service.entity';
import { Client } from '../client/entities/client.entity';
import { ClientLeadEntity } from '../client/entities/client-lead.entity';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,

    @InjectRepository(Case)
    private readonly caseRepo: Repository<Case>,

    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,

    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,

    @InjectRepository(ClientLeadEntity)
    private readonly leadRepo: Repository<ClientLeadEntity>,
  ) {}

  async getStats(): Promise<DashboardStatsDto> {
    const now = new Date();

    const [
      articlesTotal,
      articlesPublished,
      casesTotal,
      casesPublished,
      servicesTotal,
      clientsTotal,
      leadsTotal,
    ] = await Promise.all([
      this.articleRepo.count(),
      this.articleRepo.count({
        where: { datePublished: And(Not(IsNull()), LessThanOrEqual(now)) },
      }),
      this.caseRepo.count(),
      this.caseRepo.count({
        where: { datePublished: And(Not(IsNull()), LessThanOrEqual(now)) },
      }),
      this.serviceRepo.count(),
      this.clientRepo.count(),
      this.leadRepo.count(),
    ]);

    return {
      articles: { total: articlesTotal, published: articlesPublished },
      cases: { total: casesTotal, published: casesPublished },
      services: { total: servicesTotal },
      clients: { total: clientsTotal, totalLeads: leadsTotal },
    };
  }
}
