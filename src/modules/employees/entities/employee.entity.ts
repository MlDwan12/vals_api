import {
  PrimaryGeneratedColumn,
  Index,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToMany,
} from 'typeorm';
import { Article } from '../../articles/entities/article.entity';
import { Case } from '../../cases/entities/case.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  position: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  photoUrl: string | null;

  // короткое описание — карточка «О компании» + подпись под статьёй/кейсом
  @Column({ type: 'text', nullable: true })
  shortBio: string | null;

  // полное био — TipTap JSON, та же схема, что content у статей
  @Column({ type: 'jsonb', nullable: true })
  bio: Record<string, any> | null;

  @Column({ type: 'text', nullable: true })
  bioHtml: string | null;

  // стаж, свободная форма («6 лет в digital-маркетинге»)
  @Column({ type: 'text', nullable: true })
  experience: string | null;

  // ссылки на внешние профили (LinkedIn, VK, СМИ)
  @Column({ type: 'jsonb', default: () => "'[]'" })
  sameAs: string[];

  // SEO персональной страницы
  @Column({ type: 'varchar', length: 255, nullable: true })
  metaTitle: string | null;

  @Column({ type: 'text', nullable: true })
  metaDescription: string | null;

  // порядок на странице «Команда»
  @Column({ type: 'int', default: 0 })
  priority: number;

  // скрыть уволившегося без удаления записи (не теряем авторство в старых материалах)
  @Column({ type: 'boolean', default: true })
  isVisible: boolean;

  @ManyToMany(() => Article, (article) => article.authors)
  articles: Article[];

  @ManyToMany(() => Case, (caseEntity) => caseEntity.authors)
  cases: Case[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
