import { Service } from 'src/modules/services/entities/service.entity';
import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from 'typeorm';

@Entity('service_category')
export class ServiceCategory {
  @PrimaryGeneratedColumn()
  id: number;

  // Название категории (для админки / UI)
  @Column({ type: 'text' })
  name: string;

  // Описание категории
  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => Service, (service) => service.category)
  services: Service[];
}
