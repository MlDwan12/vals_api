import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { Faq } from './entities/faq.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FaqRepository extends BaseCrudRepository<Faq> {
  constructor(
    @InjectRepository(Faq)
    repo: Repository<Faq>,
  ) {
    super(repo, Faq);
  }
}
