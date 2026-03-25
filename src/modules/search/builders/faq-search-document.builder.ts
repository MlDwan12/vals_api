import { Injectable } from '@nestjs/common';
import { GlobalSearchDocument } from '../interfaces/global-search-document.interface';
import { Faq } from 'src/modules/faq/entities/faq.entity';
import { SearchEntityType } from '../interfaces/searchable-entity-type.type';

@Injectable()
export class FaqSearchDocumentBuilder {
  build(entity: Faq): GlobalSearchDocument {
    return {
      id: `faq_${entity.id}`,
      entityType: SearchEntityType.faq,
      // entityId: entity.id,
      title: entity.question,
      // slug: this.buildSlug(entity),
      description: this.buildDescription(entity.answer),
      // content: this.extractSearchableContent(entity),
      // category: 'faq',
      // tags: this.extractTags(entity),
      url: this.buildUrl(entity),
      // isPublished: true,
      // createdAt: entity.dateCreate.toISOString(),
      // updatedAt: entity.dateUpdate.toISOString(),
    };
  }

  private extractSearchableContent(entity: Faq): string {
    const parts: string[] = [];

    if (entity.question) {
      parts.push(entity.question);
    }

    if (entity.answer) {
      parts.push(this.normalizeText(entity.answer));
    }

    if (entity.service?.title) {
      parts.push(entity.service.title);
    }

    return parts
      .map((part: string) => part.trim())
      .filter((part: string) => part.length > 0)
      .join(' ');
  }

  private extractTags(entity: Faq): string[] {
    const tags: string[] = [];

    if (entity.service?.title) {
      tags.push(entity.service.title.trim());
    }

    return tags.filter((tag: string) => tag.length > 0);
  }

  private buildDescription(answer: string): string {
    const normalizedAnswer = this.normalizeText(answer);

    if (normalizedAnswer.length <= 200) {
      return normalizedAnswer;
    }

    return `${normalizedAnswer.slice(0, 197)}...`;
  }

  private buildUrl(entity: Faq): string {
    if (entity.service?.slug) {
      return `/services/${entity.service.slug}`;
    }

    return `/faq/${entity.id}`;
  }

  private buildSlug(entity: Faq): string {
    if (entity.service?.slug) {
      return `${entity.service.slug}`;
    }

    return `faq-${entity.id}`;
  }

  private normalizeText(value: string): string {
    return value
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
