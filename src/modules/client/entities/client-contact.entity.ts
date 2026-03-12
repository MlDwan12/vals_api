import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Client } from './client.entity';
import { ClientContactType } from 'src/shared/enums/contact.enum';

@Entity('client_contacts')
@Unique('uq_client_contacts_type_value', ['type', 'value'])
@Index('idx_client_contacts_client_id', ['clientId'])
@Index('idx_client_contacts_type_value', ['type', 'value'])
export class ClientContactEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'client_id', type: 'integer' })
  clientId: number;

  @ManyToOne(() => Client, (client) => client.contacts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({
    type: 'enum',
    enum: ClientContactType,
  })
  type: ClientContactType;

  @Column({ type: 'varchar', length: 255 })
  value: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
