import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { CaseFaq } from '../cases/entities/case-faq.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CaseFaqRepository extends BaseCrudRepository<CaseFaq> {
  constructor(
    @InjectRepository(CaseFaq)
    repo: Repository<CaseFaq>,
  ) {
    super(repo, CaseFaq);
  }
}
