import {
  PrimaryGeneratedColumn,
  Index,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { ArticleFaq } from './article-faq.entity';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  // описание для карточки
  @Column({ type: 'text', nullable: true })
  description: string;

  // основной контент статьи (например TipTap JSON)
  @Column({ type: 'jsonb' })
  content: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  contentHtml: string | null;

  // SEO
  @Column({ type: 'varchar', length: 255, nullable: true })
  metaTitle: string;

  @Column({ type: 'text', nullable: true })
  metaDescription: string;

  @Column({ type: 'text', nullable: true })
  keywords: string;

  @Column({
    type: 'timestamptz',
    nullable: true,
    name: 'date_published',
    default: null,
  })
  datePublished: Date | null;

  @Column({ type: 'int', default: 0 })
  priority: number;

  // Время чтения в минутах — указывается вручную в админке, не вычисляется
  @Column({ type: 'int', nullable: true })
  readingTime: number | null;

  // Авторы (many-to-many, задел на соавторов — сейчас на практике один автор)
  @ManyToMany(() => Employee, (employee) => employee.articles, {
    onDelete: 'RESTRICT',
  })
  @JoinTable({
    name: 'article_authors',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'employee_id', referencedColumnName: 'id' },
  })
  authors: Employee[];

  // Теги — many-to-many, общий справочник со статьями и кейсами
  @ManyToMany(() => Tag, (tag) => tag.articles, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'article_tags',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];

  // FAQ статьи — структурированные данные для FAQPage JSON-LD, порядок задаёт orderIndex
  @OneToMany(() => ArticleFaq, (faq) => faq.article)
  faq: ArticleFaq[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
