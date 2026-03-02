import { Exclude } from 'class-transformer';
import { Service } from 'src/modules/services/entities/service.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
} from 'typeorm';

@Entity('service_faq')
export class Faq {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'service_id' })
  serviceId: number;

  @ManyToOne(() => Service, (service) => service.faq, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @CreateDateColumn({ name: 'date_create' })
  dateCreate: Date;

  @UpdateDateColumn({ name: 'date_update' })
  dateUpdate: Date;
}
