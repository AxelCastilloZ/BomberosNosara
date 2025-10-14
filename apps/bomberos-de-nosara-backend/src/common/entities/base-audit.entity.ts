import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';


export abstract class BaseAuditEntity {
  // ==================== AUDITORÍA ====================
  @Column({ name: 'created_by', type: 'int' })
  createdBy!: number;

  @Column({ name: 'updated_by', type: 'int' })
  updatedBy!: number;

  @Column({ name: 'deleted_by', type: 'int', nullable: true })
  deletedBy?: number | null;


  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by' })
  createdByUser!: User;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'updated_by' })
  updatedByUser!: User;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'deleted_by' })
  deletedByUser?: User;

  // ==================== TIMESTAMPS ====================
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}