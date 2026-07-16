import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { TagWithCountsDto } from './dto/tag-with-counts.dto';
import { TagShortDto } from './dto/tag-short.dto';

@Injectable()
export class TagRepository extends BaseCrudRepository<Tag> {
  constructor(
    @InjectRepository(Tag)
    repo: Repository<Tag>,
  ) {
    super(repo, Tag);
  }

  async existsBySlug(slug: string, excludeId?: number): Promise<boolean> {
    const qb = this.repository
      .createQueryBuilder('tag')
      .where('tag.slug = :slug', { slug });

    if (excludeId) {
      qb.andWhere('tag.id != :excludeId', { excludeId });
    }

    return (await qb.getCount()) > 0;
  }

  async findByNameCI(name: string): Promise<Tag | null> {
    return this.repository
      .createQueryBuilder('tag')
      .where('LOWER(tag.name) = LOWER(:name)', { name })
      .getOne();
  }

  /** Список для админ-таблицы: Название + Кол-во статей/кейсов. */
  async findAllWithCounts(): Promise<TagWithCountsDto[]> {
    const rows = await this.repository
      .createQueryBuilder('tag')
      .leftJoin('article_tags', 'at', 'at.tag_id = tag.id')
      .leftJoin('case_tags', 'ct', 'ct.tag_id = tag.id')
      .select(['tag.id AS id', 'tag.slug AS slug', 'tag.name AS name', 'tag.priority AS priority'])
      .addSelect('COUNT(DISTINCT at.article_id)', 'articlesCount')
      .addSelect('COUNT(DISTINCT ct.case_id)', 'casesCount')
      .groupBy('tag.id')
      .orderBy('tag.name', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      priority: Number(r.priority),
      articlesCount: Number(r.articlesCount),
      casesCount: Number(r.casesCount),
    }));
  }

  /**
   * Публичный список для фильтра на сайте — только теги, реально использованные
   * в опубликованном контенте. `type` сужает до одного источника (статьи/кейсы) —
   * без него это объединение обоих (как было раньше, для обратной совместимости).
   */
  async findPublicList(type?: 'article' | 'case'): Promise<TagShortDto[]> {
    const articleIds = `
      SELECT at.tag_id FROM article_tags at
      INNER JOIN articles a ON a.id = at.article_id
      WHERE a.date_published IS NOT NULL AND a.date_published <= NOW()
    `;
    const caseIds = `
      SELECT ct.tag_id FROM case_tags ct
      INNER JOIN cases c ON c.id = ct.case_id
      WHERE c.date_published IS NOT NULL AND c.date_published <= NOW()
    `;

    const idsQuery =
      type === 'article' ? articleIds
      : type === 'case' ? caseIds
      : `${articleIds} UNION ${caseIds}`;

    return this.repository.query(`
      SELECT DISTINCT t.id, t.slug, t.name, t.priority FROM tags t
      WHERE t.id IN (${idsQuery})
      ORDER BY t.priority DESC, t.name ASC
    `);
  }
}
