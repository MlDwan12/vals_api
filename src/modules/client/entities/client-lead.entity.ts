import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LeadType } from 'src/shared/enums/lead-type.enum';
import { Client } from './client.entity';

@Entity('client_leads')
@Index('idx_client_leads_client_id', ['clientId'])
@Index('idx_client_leads_type', ['type'])
@Index('idx_client_leads_created_at', ['createdAt'])
export class ClientLeadEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'client_id', type: 'integer' })
  clientId: number;

  @ManyToOne(() => Client, (client) => client.leads, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({
    name: 'external_system',
    type: 'varchar',
    length: 50,
    default: 'BITRIX',
  })
  externalSystem: string;

  @Column({
    type: 'enum',
    enum: LeadType,
  })
  type: LeadType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({ name: 'phone_raw', type: 'varchar', length: 64, nullable: true })
  phoneRaw: string | null;

  @Column({
    name: 'phone_normalized',
    type: 'varchar',
    length: 32,
    nullable: true,
  })
  phoneNormalized: string | null;

  @Column({ name: 'email_raw', type: 'varchar', length: 255, nullable: true })
  emailRaw: string | null;

  @Column({
    name: 'email_normalized',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  emailNormalized: string | null;

  @Column({ name: 'message', type: 'text', nullable: true })
  message: string | null;

  @Column({ name: 'comment', type: 'text', nullable: true })
  comment: string | null;

  @Column({ name: 'utm', type: 'jsonb', nullable: true })
  utm: Record<string, string> | null;

  @Column({ name: 'payload', type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ name: 'bitrix_payload', type: 'jsonb', nullable: true })
  bitrixPayload: Record<string, unknown> | null;

  @Column({
    name: 'bitrix_lead_id',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  bitrixLeadId: string | null;

  @Column({ name: 'bitrix_response', type: 'jsonb', nullable: true })
  bitrixResponse: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
