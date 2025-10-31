import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { EstadoEquipo, TipoEquipo } from '../enums/equipo-bomberil.enums';
import { MantenimientoEquipo } from '../entities/equipo-mantenimiento.entity';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';

@Entity('equipos_bomberiles')
export class EquipoBomberil extends BaseAuditEntity {
  // ==================== IDENTIFICACIÓN ====================
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 100 })
  numeroSerie!: string;

  @Column({ length: 200 })
  nombre!: string;

  @Column({ 
    type: 'enum', 
    enum: TipoEquipo,
    comment: 'Tipo de equipo bomberil' 
  })
  tipo!: TipoEquipo;

  // ==================== ESTADO Y CONDICIÓN ====================
  @Column({ 
    type: 'enum',
    enum: ['nuevo', 'usado'],
    name: 'estado_inicial',
    comment: 'Estado al momento de adquisición'
  })
  estadoInicial!: 'nuevo' | 'usado';

  @Column({ 
    type: 'enum', 
    enum: EstadoEquipo,
    name: 'estado_actual',
    comment: 'Estado operacional actual'
  })
  estadoActual!: EstadoEquipo;

  // ==================== INFORMACIÓN OPERATIVA ====================
  @Column({ type: 'date', name: 'fecha_adquisicion' })
  fechaAdquisicion!: Date;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  // ==================== MANTENIMIENTO ====================
  @OneToMany(() => MantenimientoEquipo, (m) => m.equipo, {
    cascade: false,
  })
  mantenimientos!: MantenimientoEquipo[];
}