import { Service } from '../../services/entities/service.entity';
import { BillingCycle } from 'src/shared/types/tariff/tariff.type';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tariffs')
export class Tariff {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Service, (service) => service.tariffs, {
    onDelete: 'CASCADE',
  })
  service: Service;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'varchar', length: 128 })
  from: string;

  @Column({ type: 'text' })
  features: string;

  @Column({ type: 'boolean', default: false })
  is_popular?: boolean;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  billingCycles: BillingCycle[];

  @Column({ type: 'int', nullable: true })
  basePrice?: number;

  @Column({ type: 'int', default: 0 })
  order_index: number;
}
