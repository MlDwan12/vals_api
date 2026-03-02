import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ServiceRepository extends BaseCrudRepository<Service> {
  constructor(
    @InjectRepository(Service)
    repo: Repository<Service>,
  ) {
    super(repo, Service);
  }
}
