import { Injectable } from '@nestjs/common';
import { GlobalSearchDocument } from '../interfaces/global-search-document.interface';
import { Case } from 'src/modules/cases/entities/case.entity';
import { SearchEntityType } from '../interfaces/searchable-entity-type.type';

@Injectable()
export class CaseSearchDocumentBuilder {
  build(entity: Case): GlobalSearchDocument {
    return {
      id: `case_${entity.id}`,
      entityType: SearchEntityType.case,
      // entityId: entity.id,
      title: entity.title,
      // slug: entity.slug,
      description: entity.description ?? '',
      // content: this.extractSearchableContent(entity),
      // category: this.extractCategory(entity),
      // tags: this.extractTags(entity),
      url: `/cases/${entity.slug}`,
      // isPublished: true,
      // createdAt: entity.createdAt.toISOString(),
      // updatedAt: entity.updatedAt.toISOString(),
    };
  }

  private extractSearchableContent(entity: Case): string {
    const parts: string[] = [];

    if (entity.description) {
      parts.push(entity.description);
    }

    if (entity.problem) {
      parts.push(entity.problem);
    }

    if (entity.result) {
      parts.push(entity.result);
    }

    if (
      typeof entity.contentHtml === 'string' &&
      entity.contentHtml.length > 0
    ) {
      parts.push(this.normalizeText(entity.contentHtml));
    }

    return parts
      .map((part: string) => part.trim())
      .filter((part: string) => part.length > 0)
      .join(' ');
  }

  private extractCategory(entity: Case): string | null {
    if (!Array.isArray(entity.industry) || entity.industry.length === 0) {
      return null;
    }

    return entity.industry.join(', ');
  }

  private extractTags(entity: Case): string[] {
    const keywordTags: string[] = this.extractKeywordTags(entity.keywords);
    const industryTags: string[] = this.extractIndustryTags(entity.industry);
    const serviceTags: string[] = this.extractServiceTags(entity);

    return Array.from(
      new Set<string>([...keywordTags, ...industryTags, ...serviceTags]),
    );
  }

  private extractKeywordTags(keywords?: string): string[] {
    if (!keywords) {
      return [];
    }

    return keywords
      .split(',')
      .map((keyword: string) => keyword.trim())
      .filter((keyword: string) => keyword.length > 0);
  }

  private extractIndustryTags(industry: string[]): string[] {
    if (!Array.isArray(industry) || industry.length === 0) {
      return [];
    }

    return industry
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);
  }

  private extractServiceTags(entity: Case): string[] {
    if (!Array.isArray(entity.services) || entity.services.length === 0) {
      return [];
    }

    return entity.services
      .map((service) => service.title?.trim() ?? '')
      .filter((title: string) => title.length > 0);
  }

  private normalizeText(value: string): string {
    return value
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
