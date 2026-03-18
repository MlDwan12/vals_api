import { Case } from '../../cases/entities/case.entity';
import { Faq } from '../../faq/entities/faq.entity';
import { ServiceCategory } from '../../service_categories/entities/service_category.entity';
import { ServiceStep } from '../../service_steps/entities/service_step.entity';
import { Tariff } from '../../tariffs/entities/tariff.entity';
import { BackgroundColor } from 'src/shared/enums/backgroundColor.enum';
import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Entity,
  JoinTable,
  ManyToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  // // Категории услуги
  // @ManyToMany(() => ServiceCategory, (category) => category.services)
  // @JoinTable({
  //   name: 'service_to_category', // имя join таблицы (опционально)
  // })
  // categories: ServiceCategory[];

  @ManyToOne(() => ServiceCategory, (category) => category.services, {
    nullable: false,
    onDelete: 'RESTRICT', // или CASCADE если нужно
  })
  @JoinColumn({ name: 'category_id' })
  category: ServiceCategory;

  // Заголовок для карточки
  @Column({ type: 'text' })
  title: string;

  // Подзаголовок
  @Column({ type: 'text', nullable: true })
  subtitle?: string;

  // Полное описание
  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  subDescription: string;

  // Короткий список для карточек (3 пункта)
  @Column({ type: 'text', array: true, nullable: true })
  list?: string[];

  // Иконка
  @Column({ type: 'varchar', length: 64 })
  icon: string;

  @Column({
    type: 'enum',
    enum: BackgroundColor,
    default: BackgroundColor.WHITE,
  })
  backgroundColor: BackgroundColor;

  // Этапы услуги
  @OneToMany(() => ServiceStep, (step) => step.service)
  stages: ServiceStep[];

  Тарифы;
  @OneToMany(() => Tariff, (tariff) => tariff.service)
  tariffs: Tariff[];

  // Кейсы
  @ManyToMany(() => Case, (c) => c.services)
  cases: Case[];

  // FAQ
  @OneToMany(() => Faq, (faq) => faq.service)
  faq: Faq[];

  @CreateDateColumn({ name: 'date_create' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'date_update' })
  updatedAt: Date;
}
