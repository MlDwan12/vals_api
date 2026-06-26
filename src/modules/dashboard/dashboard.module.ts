import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Article } from '../articles/entities/article.entity';
import { Case } from '../cases/entities/case.entity';
import { Service } from '../services/entities/service.entity';
import { Client } from '../client/entities/client.entity';
import { ClientLeadEntity } from '../client/entities/client-lead.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Case, Service, Client, ClientLeadEntity]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
