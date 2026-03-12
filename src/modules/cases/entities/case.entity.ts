import { Industry } from '../../industry/entities/industry.entity';
import { Service } from '../../services/entities/service.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
} from 'typeorm';

@Entity('cases')
export class Case {
  @PrimaryGeneratedColumn()
  id: number;

  // ===== Связь с услугами (M2M) =====
  @ManyToMany(() => Service, (service) => service.cases, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'service_to_case',
    joinColumn: { name: 'case_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'service_id', referencedColumnName: 'id' },
  })
  services: Service[];
  // ===== Отрасль: JSON массив строк =====
  // Пример: ["IT", "FinTech", "E-commerce"]
  @Column({ name: 'industry', type: 'jsonb', default: () => "'[]'" })
  industry: string[];

  // ===== Контент =====
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text' })
  problem: string;

  @Column({ type: 'text' })
  result: string;

  @Column({ type: 'jsonb', nullable: true })
  content?: Record<string, any>;

  // ===== SEO =====
  @Column({ type: 'varchar', length: 255, nullable: true })
  metaTitle?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  metaDescription?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  keywords?: string;

  // ===== Даты =====
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
