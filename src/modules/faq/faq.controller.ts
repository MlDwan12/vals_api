import { Controller } from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { Faq } from './entities/faq.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('FAQ')
@Controller('faq')
export class FaqController extends BaseCrudController<
  Faq,
  CreateFaqDto,
  UpdateFaqDto
> {
  protected entityName: string;

  constructor(protected readonly service: FaqService) {
    super(service);
  }
}
