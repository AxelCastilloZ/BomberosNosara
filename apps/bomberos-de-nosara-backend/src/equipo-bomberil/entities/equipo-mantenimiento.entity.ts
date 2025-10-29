import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EquipoBomberil } from './equipo-bomberil.entity';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
import { EstadoMantenimiento, TipoMantenimiento } from '../enums/mantenimiento.enums';

@Entity('equipo_mantenimiento')
export class MantenimientoEquipo extends BaseAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ==================== RELACIÓN CON EQUIPO ====================
  @ManyToOne(() => EquipoBomberil, equipo => equipo.mantenimientos, {
    onDelete: 'NO ACTION', // Permite que el mantenimiento persista aunque se elimine el equipo
  })
  @JoinColumn({ name: 'equipo_id' })
  equipo!: EquipoBomberil;

  @Column({ name: 'equipo_id', type: 'uuid' })
  equipoId!: string;

  // ==================== ESTADO DEL MANTENIMIENTO ====================
  @Column({
    type: 'enum',
    enum: EstadoMantenimiento,
    default: EstadoMantenimiento.PENDIENTE,
    comment: 'Estado del ciclo de vida del mantenimiento'
  })
  estado!: EstadoMantenimiento;

  // ==================== TIPO DE MANTENIMIENTO ====================
  @Column({
    type: 'enum',
    enum: TipoMantenimiento,
    comment: 'Tipo de mantenimiento: preventivo o correctivo'
  })
  tipo!: TipoMantenimiento;

  // ==================== INFORMACIÓN BÁSICA ====================
  @Column({ type: 'date' })
  fecha!: Date;

  @Column()
  descripcion!: string;

  // ==================== DATOS DE COMPLETADO (OPCIONALES HASTA COMPLETAR) ====================
  @Column({ nullable: true })
  tecnico?: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  costo?: number;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;
}