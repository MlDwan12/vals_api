import { Controller, Post } from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { Faq } from './entities/faq.entity';
import { ApiTags } from '@nestjs/swagger';
import { ReindexResult } from '../search/interfaces/reindex-result.interface';
import { FaqSearchReindexService } from './faq-search-reindex.service';

@ApiTags('FAQ')
@Controller('faq')
export class FaqController extends BaseCrudController<
  Faq,
  CreateFaqDto,
  UpdateFaqDto
> {
  protected entityName: string;

  constructor(
    protected readonly service: FaqService,
    private readonly faqSearchReindexService: FaqSearchReindexService,
  ) {
    super(service);
  }

  @Post('reindex')
  async reindexArticles(): Promise<ReindexResult> {
    return this.faqSearchReindexService.reindex();
  }
}
