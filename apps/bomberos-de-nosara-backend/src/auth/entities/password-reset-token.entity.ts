// src/auth/entities/password-reset-token.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn,
} from 'typeorm';

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'int' })
  userId!: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 128 })
  token!: string;

  @Column({ type: 'datetime' })
  expiresAt!: Date;

  @Column({ type: 'datetime', nullable: true, default: null })
  consumedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
