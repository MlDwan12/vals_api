import { Controller } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { Case } from './entities/case.entity';
import { ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/core/crud/base.controller';

@ApiTags('Кейсы')
@Controller('cases')
export class CasesController extends BaseCrudController<
  Case,
  CreateCaseDto,
  UpdateCaseDto
> {
  protected entityName: string;

  constructor(protected readonly service: CasesService) {
    super(service);
  }
}
