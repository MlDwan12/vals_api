import { Injectable } from '@nestjs/common';
import { GlobalSearchDocument } from '../interfaces/global-search-document.interface';
import { Article } from 'src/modules/articles/entities/article.entity';
import { SearchEntityType } from '../interfaces/searchable-entity-type.type';

@Injectable()
export class ArticleSearchDocumentBuilder {
  build(article: Article): GlobalSearchDocument {
    return {
      id: `article_${article.id}`,
      entityType: SearchEntityType.article,
      // entityId: article.id,
      title: article.title,
      // slug: article.slug,
      description: article.description ?? '',
      // content: this.extractSearchableContent(article),
      // category: null,
      // tags: this.extractTags(article),
      url: `/articles/${article.slug}`,
      // isPublished: true,
      // createdAt: article.createdAt.toISOString(),
      // updatedAt: article.updatedAt.toISOString(),
    };
  }

  private extractSearchableContent(article: Article): string {
    if (
      typeof article.contentHtml === 'string' &&
      article.contentHtml.length > 0
    ) {
      return this.normalizeText(article.contentHtml);
    }

    return '';
  }

  private extractCategory(entity: Article): string | null {
    if (!Array.isArray(entity.keywords) || entity.keywords.length === 0) {
      return null;
    }

    return entity.keywords.join(', ');
  }

  private extractTags(article: Article): string[] {
    if (!article.keywords) {
      return [];
    }

    return article.keywords
      .split(',')
      .map((keyword: string) => keyword.trim())
      .filter((keyword: string) => keyword.length > 0);
  }

  private normalizeText(value: string): string {
    return value
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
