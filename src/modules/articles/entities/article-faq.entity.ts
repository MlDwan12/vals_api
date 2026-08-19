import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
} from 'typeorm';
import { Article } from './article.entity';

@Entity('article_faq')
export class ArticleFaq {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'article_id' })
  articleId: number;

  @ManyToOne(() => Article, (article) => article.faq, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @CreateDateColumn({ name: 'date_create' })
  dateCreate: Date;

  @UpdateDateColumn({ name: 'date_update' })
  dateUpdate: Date;
}
