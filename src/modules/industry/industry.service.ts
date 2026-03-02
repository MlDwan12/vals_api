import { Injectable } from '@nestjs/common';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpdateIndustryDto } from './dto/update-industry.dto';
import { Industry } from './entities/industry.entity';
import { IndustryRepository } from './industry.repository';
import { PinoLogger } from 'nestjs-pino';
import { BaseCrudService } from 'src/core/crud/base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudRepository } from 'src/core/crud/base.repository';

@Injectable()
export class IndustryService extends BaseCrudService<
  Industry,
  CreateIndustryDto,
  UpdateIndustryDto
> {
  protected repository: BaseCrudRepository<Industry>;
  constructor(
    @InjectRepository(Industry) private readonly repo: Repository<Industry>,

    protected readonly logger: PinoLogger,
  ) {
    super(logger);
    this.repository = new IndustryRepository(this.repo);
  }
}
