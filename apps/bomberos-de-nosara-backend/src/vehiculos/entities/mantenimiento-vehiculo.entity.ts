import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vehiculo } from './vehiculo.entity';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
import { EstadoMantenimiento } from '../enums/mantenimiento.enums';

@Entity('mantenimientos')
export class Mantenimiento extends BaseAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ==================== RELACIÓN CON VEHÍCULO ====================
  @ManyToOne(() => Vehiculo, vehiculo => vehiculo.mantenimientos, {
    onDelete: 'NO ACTION', // Permite que el mantenimiento persista aunque se elimine el vehículo
  })
  @JoinColumn({ name: 'vehiculo_id' })
  vehiculo!: Vehiculo;

  @Column({ name: 'vehiculo_id', type: 'uuid' })
  vehiculoId!: string;

  // ==================== ESTADO DEL MANTENIMIENTO ====================
  @Column({
    type: 'enum',
    enum: EstadoMantenimiento,
    default: EstadoMantenimiento.PENDIENTE,
    comment: 'Estado del ciclo de vida del mantenimiento'
  })
  estado!: EstadoMantenimiento;

  // ==================== INFORMACIÓN BÁSICA ====================
  @Column({ type: 'date' })
  fecha!: Date;

  @Column()
  descripcion!: string;

  // ==================== DATOS DE COMPLETADO (OPCIONALES HASTA COMPLETAR) ====================
  @Column({ type: 'int', nullable: true })
  kilometraje?: number;

  @Column({ nullable: true })
  tecnico?: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  costo?: number;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;
}