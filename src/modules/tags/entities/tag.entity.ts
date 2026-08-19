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

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  // порядок тега в списках/фильтре на сайте — не влияет на сортировку статей/кейсов
  @Column({ type: 'int', default: 0 })
  priority: number;

  @ManyToMany(() => Article, (article) => article.tags)
  articles: Article[];

  @ManyToMany(() => Case, (caseEntity) => caseEntity.tags)
  cases: Case[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
