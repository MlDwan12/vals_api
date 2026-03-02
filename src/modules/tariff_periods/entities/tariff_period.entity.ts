import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tariff_periods')
export class TariffPeriod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  months: number;

  @Column({ type: 'int', nullable: true })
  discountPercent: number;
}
