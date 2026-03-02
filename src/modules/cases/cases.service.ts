import { Injectable } from '@nestjs/common';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { Case } from './entities/case.entity';
import { CaseRepository } from './cases.repository';
import { PinoLogger } from 'nestjs-pino';
import { BaseCrudService } from 'src/core/crud/base.service';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CasesService extends BaseCrudService<
  Case,
  CreateCaseDto,
  UpdateCaseDto
> {
  protected repository: BaseCrudRepository<Case>;
  constructor(
    @InjectRepository(Case) private readonly repo: Repository<Case>,
    protected readonly logger: PinoLogger,
  ) {
    super(logger);
    this.repository = new CaseRepository(this.repo);
  }
}
