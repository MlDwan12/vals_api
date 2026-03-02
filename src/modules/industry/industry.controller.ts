import { Controller } from '@nestjs/common';
import { IndustryService } from './industry.service';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpdateIndustryDto } from './dto/update-industry.dto';
import { Industry } from './entities/industry.entity';
import { ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/core/crud/base.controller';

@ApiTags('Отрасли')
@Controller('industry')
export class IndustryController extends BaseCrudController<
  Industry,
  CreateIndustryDto,
  UpdateIndustryDto
> {
  protected entityName: string;

  constructor(protected readonly service: IndustryService) {
    super(service);
  }
}
