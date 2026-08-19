import { Injectable } from '@nestjs/common';
import { CreateCaseFaqDto } from './dto/create-case-faq.dto';
import { UpdateCaseFaqDto } from './dto/update-case-faq.dto';
import { CaseFaq } from '../cases/entities/case-faq.entity';
import { CaseFaqRepository } from './case-faq.repository';
import { PinoLogger } from 'nestjs-pino';
import { BaseCrudService } from 'src/core/crud/base.service';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CaseFaqService extends BaseCrudService<
  CaseFaq,
  CreateCaseFaqDto,
  UpdateCaseFaqDto
> {
  protected repository: BaseCrudRepository<CaseFaq>;

  constructor(
    @InjectRepository(CaseFaq) private readonly repo: Repository<CaseFaq>,
    protected readonly logger: PinoLogger,
  ) {
    super(logger);
    this.repository = new CaseFaqRepository(this.repo);
  }
}
