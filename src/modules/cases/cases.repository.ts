import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { Case } from './entities/case.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CaseRepository extends BaseCrudRepository<Case> {
  constructor(
    @InjectRepository(Case)
    repo: Repository<Case>,
  ) {
    super(repo, Case);
  }
}
