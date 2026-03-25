import { Injectable } from '@nestjs/common';
import { Service } from 'src/modules/services/entities/service.entity';
import { GlobalSearchDocument } from '../interfaces/global-search-document.interface';

@Injectable()
export class ServiceSearchDocumentBuilder {
  build(service: Service): GlobalSearchDocument {
    return {
      id: `service_${service.id}`,
      entityType: 'service',
      entityId: service.id,
      title: service.title,
      slug: service.slug,
      description: this.buildDescription(service),
      content: this.buildSearchableContent(service),
      category: service.category?.name ?? null,
      tags: this.extractTags(service),
      url: `/services/${service.slug}`,
      isPublished: true,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    };
  }

  private buildDescription(service: Service): string {
    const parts: string[] = [];

    if (
      typeof service.subtitle === 'string' &&
      service.subtitle.trim().length > 0
    ) {
      parts.push(service.subtitle);
    }

    if (
      typeof service.description === 'string' &&
      service.description.trim().length > 0
    ) {
      parts.push(service.description);
    }

    if (
      typeof service.subDescription === 'string' &&
      service.subDescription.trim().length > 0
    ) {
      parts.push(service.subDescription);
    }

    return this.normalizeText(parts.join(' '));
  }

  private buildSearchableContent(service: Service): string {
    const parts: string[] = [];

    if (typeof service.title === 'string' && service.title.trim().length > 0) {
      parts.push(service.title);
    }

    if (
      typeof service.subtitle === 'string' &&
      service.subtitle.trim().length > 0
    ) {
      parts.push(service.subtitle);
    }

    if (
      typeof service.description === 'string' &&
      service.description.trim().length > 0
    ) {
      parts.push(service.description);
    }

    if (
      typeof service.subDescription === 'string' &&
      service.subDescription.trim().length > 0
    ) {
      parts.push(service.subDescription);
    }

    if (Array.isArray(service.list) && service.list.length > 0) {
      parts.push(
        ...service.list.filter((item: string) => item.trim().length > 0),
      );
    }

    if (
      service.category &&
      typeof service.category.name === 'string' &&
      service.category.name.trim().length > 0
    ) {
      parts.push(service.category.name);
    }

    if (Array.isArray(service.stages)) {
      for (const stage of service.stages) {
        if (typeof stage.title === 'string' && stage.title.trim().length > 0) {
          parts.push(stage.title);
        }

        if (
          'description' in stage &&
          typeof stage.description === 'string' &&
          stage.description.trim().length > 0
        ) {
          parts.push(stage.description);
        }
      }
    }

    if (Array.isArray(service.tariffs)) {
      for (const tariff of service.tariffs) {
        if (
          'title' in tariff &&
          typeof tariff.title === 'string' &&
          tariff.title.trim().length > 0
        ) {
          parts.push(tariff.title);
        }

        if (
          'description' in tariff &&
          typeof tariff.description === 'string' &&
          tariff.description.trim().length > 0
        ) {
          parts.push(tariff.description);
        }
      }
    }

    if (Array.isArray(service.faq)) {
      for (const faq of service.faq) {
        if (
          'question' in faq &&
          typeof faq.question === 'string' &&
          faq.question.trim().length > 0
        ) {
          parts.push(faq.question);
        }

        if (
          'answer' in faq &&
          typeof faq.answer === 'string' &&
          faq.answer.trim().length > 0
        ) {
          parts.push(faq.answer);
        }
      }
    }

    return this.normalizeText(parts.join(' '));
  }

  private extractTags(service: Service): string[] {
    const tags: string[] = [];

    if (
      service.category &&
      typeof service.category.name === 'string' &&
      service.category.name.trim().length > 0
    ) {
      tags.push(this.normalizeText(service.category.name));
    }

    return [...new Set(tags)];
  }

  private normalizeText(value: string): string {
    return value
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
