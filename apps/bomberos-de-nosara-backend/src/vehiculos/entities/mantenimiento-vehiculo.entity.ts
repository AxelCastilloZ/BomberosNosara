import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Vehiculo } from './vehiculo.entity';
import { User } from '../../users/entities/user.entity';

@Entity('mantenimientos')
export class Mantenimiento {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Vehiculo, vehiculo => vehiculo.mantenimientos)
  vehiculo!: Vehiculo;

  @Column({ type: 'date' })
  fecha!: Date;

  @Column()
  descripcion!: string;

  @Column()
  kilometraje!: number;

  @Column()
  tecnico!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  costo!: number;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  // ==================== AUDITORÍA ====================
  @Column({ name: 'created_by', type: 'int' })
  createdBy!: number;

  @Column({ name: 'updated_by', type: 'int' })
  updatedBy!: number;

  @Column({ name: 'deleted_by', type: 'int', nullable: true })
  deletedBy?: number | null;

  // Relaciones con usuarios
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
  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt?: Date;
}