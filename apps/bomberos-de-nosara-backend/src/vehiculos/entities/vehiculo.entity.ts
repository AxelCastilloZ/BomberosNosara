import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EstadoVehiculo, TipoVehiculo } from '../enums/vehiculo-bomberil.enums';
import { Mantenimiento } from './mantenimiento-vehiculo.entity';
import { User } from '../../users/entities/user.entity';

@Entity('vehiculos')
export class Vehiculo {
  // ==================== IDENTIFICACIÓN ====================
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  placa: string;

  @Column({ 
    type: 'enum', 
    enum: TipoVehiculo,
    comment: 'Tipo de vehículo de la flota' 
  })
  tipo: TipoVehiculo;

  // ==================== ESTADO Y CONDICIÓN ====================
  @Column({ 
    type: 'enum',
    enum: ['nuevo', 'usado'],
    comment: 'Estado al momento de adquisición'
  })
  estadoInicial: 'nuevo' | 'usado';

  @Column({ 
    type: 'enum', 
    enum: EstadoVehiculo,
    comment: 'Estado operacional actual'
  })
  estadoActual: EstadoVehiculo;

  // ==================== INFORMACIÓN OPERATIVA ====================
  @Column({ type: 'date' })
  fechaAdquisicion: Date;

  @Column({ type: 'int', unsigned: true, default: 0 })
  kilometraje: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  fotoUrl?: string;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  // ==================== REPOSICIÓN ====================
  @Column({ type: 'boolean', default: false })
  reposicionSolicitada: boolean;

  @Column({ type: 'text', nullable: true })
  motivoReposicion?: string;

  @Column({ type: 'text', nullable: true })
  observacionesReposicion?: string;

  // ==================== MANTENIMIENTO ====================
  @Column({ type: 'date', nullable: true })
  fechaProximoMantenimiento?: Date;

  @OneToMany(() => Mantenimiento, (m) => m.vehiculo, {
    cascade: false,
  })
  mantenimientos: Mantenimiento[];

  // ==================== AUDITORÍA ====================
  @Column({ name: 'created_by', type: 'int' })
  createdBy: number;

  @Column({ name: 'updated_by', type: 'int' })
  updatedBy: number;

  @Column({ name: 'deleted_by', type: 'int', nullable: true })
  deletedBy?: number | null;

  // Relaciones con usuarios (eager: false para evitar cargas innecesarias)
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by' })
  createdByUser: User;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'updated_by' })
  updatedByUser: User;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'deleted_by' })
  deletedByUser?: User;

  // ==================== TIMESTAMPS ====================
  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt?: Date;
}