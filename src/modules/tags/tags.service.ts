import { Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';
import { BaseCrudService } from 'src/core/crud/base.service';
import { TagRepository } from './tags.repository';
import { TagWithCountsDto } from './dto/tag-with-counts.dto';
import { TagShortDto } from './dto/tag-short.dto';
import { transliterate } from 'src/shared/lib/slug/transliterate';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class TagsService extends BaseCrudService<Tag, CreateTagDto, UpdateTagDto> {
  constructor(
    protected readonly logger: PinoLogger,
    protected readonly repository: TagRepository,
  ) {
    super(logger);
  }

  /** Переопределяет generic create — идемпотентно по имени (creatable-комбобокс в админке не должен плодить дубли) + генерирует slug. */
  async create(dto: CreateTagDto): Promise<Tag> {
    const name = dto.name.trim();
    const existing = await this.repository.findByNameCI(name);
    if (existing) return existing;

    const slug = await this.generateUniqueSlug(name);
    return this.repository.create({ name, slug });
  }

  /** Переопределяет generic update — при смене name перегенерирует slug. */
  async update(id: number, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findById(id);

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (name !== tag.name) {
        tag.name = name;
        tag.slug = await this.generateUniqueSlug(name, tag.id);
        await this.repository.repository.save(tag);
      }
    }

    return tag;
  }

  // remove() не переопределяется — hard delete работает из коробки через
  // BaseCrudService/BaseCrudRepository: tag_id в article_tags/case_tags — ON DELETE CASCADE,
  // FK violation невозможен, статьи/кейсы просто теряют связь с удалённым тегом.

  async findAllWithCounts(): Promise<TagWithCountsDto[]> {
    return this.repository.findAllWithCounts();
  }

  async findPublicList(type?: 'article' | 'case'): Promise<TagShortDto[]> {
    return this.repository.findPublicList(type);
  }

  private async generateUniqueSlug(name: string, excludeId?: number): Promise<string> {
    const base = transliterate(name) || 'tag';
    let candidate = base;
    let suffix = 2;

    while (await this.repository.existsBySlug(candidate, excludeId)) {
      candidate = `${base}-${suffix++}`;
    }

    return candidate;
  }
}
