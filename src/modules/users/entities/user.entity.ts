import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('IDX_USERS_USERNAME_UNIQUE', { unique: true })
  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar', select: false })
  password: string;

  @Index('IDX_USERS_ROLE')
  @Column({
    type: 'varchar',
    length: 32,
    default: UserRole.USER,
  })
  role: UserRole;
}
