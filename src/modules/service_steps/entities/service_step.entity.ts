import { Expose } from 'class-transformer';
import { Service } from 'src/modules/services/entities/service.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('service_steps')
@Index(['service', 'step'], { unique: true })
export class ServiceStep {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  step: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  time?: string;

  @Column({ name: 'service_id' })
  serviceId: number;

  @ManyToOne(() => Service, (service) => service.stages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
