import { Injectable } from '@nestjs/common';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { Faq } from './entities/faq.entity';
import { FaqRepository } from './faq.repository';
import { PinoLogger } from 'nestjs-pino';
import { BaseCrudService } from 'src/core/crud/base.service';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FaqService extends BaseCrudService<
  Faq,
  CreateFaqDto,
  UpdateFaqDto
> {
  protected repository: BaseCrudRepository<Faq>;
  constructor(
    @InjectRepository(Faq) private readonly repo: Repository<Faq>,
    protected readonly logger: PinoLogger,
  ) {
    super(logger);
    this.repository = new FaqRepository(this.repo);
  }
}
