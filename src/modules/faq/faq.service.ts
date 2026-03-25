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
import { FaqSearchDocumentBuilder } from '../search/builders/faq-search-document.builder';
import { SearchIndexService } from '../search/services/search-index.service';

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
    private readonly searchIndexService: SearchIndexService,
    private readonly faqSearchDocumentBuilder: FaqSearchDocumentBuilder,
  ) {
    super(logger);
    this.repository = new FaqRepository(this.repo);
  }

  async create(createDto: CreateFaqDto): Promise<Faq> {
    const faq = await this.repository.create(createDto);

    await this.searchIndexService.upsertDocument(
      this.faqSearchDocumentBuilder.build(faq),
    );

    return faq;
  }

  async update(id: number, updateDto: UpdateFaqDto): Promise<Faq> {
    const faq = await this.repository.update(id, updateDto);

    await this.searchIndexService.upsertDocument(
      this.faqSearchDocumentBuilder.build(faq!),
    );

    return faq!;
  }

  async remove(id: number): Promise<void> {
    const faq = await this.findOneOrFail({ where: { id } });

    await this.repository.delete(id);

    await this.searchIndexService.deleteDocument(`faq_${faq.id}`);
  }
}
