import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('password_reset_tokens')
@Index('IDX_user_consumed', ['userId', 'consumedAt'])
@Index('IDX_token_unique', ['token'], { unique: true })
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', unsigned: true })
  userId!: number;

  @Column({ type: 'varchar', length: 128, unique: true })
  token!: string; // (futuro recomendado: usar tokenHash)

  @Column({ type: 'datetime' })
  expiresAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  consumedAt: Date | null = null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
