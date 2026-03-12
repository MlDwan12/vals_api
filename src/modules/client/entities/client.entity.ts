import {
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
} from 'typeorm';
import { ClientContactEntity } from './client-contact.entity';
import { ClientLeadEntity } from './client-lead.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({
    name: 'primary_phone',
    type: 'varchar',
    length: 32,
    nullable: true,
  })
  primaryPhone: string | null;

  @Column({
    name: 'primary_email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  primaryEmail: string | null;

  @Column({ name: 'leads_count', type: 'integer', default: 0 })
  leadsCount: number;

  @Column({ name: 'last_lead_at', type: 'timestamptz', nullable: true })
  lastLeadAt: Date | null;

  @Column({ name: 'is_merged', type: 'boolean', default: false })
  isMerged: boolean;

  @Column({ name: 'merged_into_client_id', type: 'integer', nullable: true })
  mergedIntoClientId: number | null;

  @OneToMany(() => ClientContactEntity, (contact) => contact.client)
  contacts: ClientContactEntity[];

  @OneToMany(() => ClientLeadEntity, (lead) => lead.client)
  leads: ClientLeadEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
