import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { Industry } from './entities/industry.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class IndustryRepository extends BaseCrudRepository<Industry> {
  constructor(
    @InjectRepository(Industry)
    repo: Repository<Industry>,
  ) {
    super(repo, Industry);
  }
}
