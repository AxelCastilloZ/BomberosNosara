import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { EstadoVehiculo, TipoVehiculo } from '../enums/vehiculo-bomberil.enums';
import { Mantenimiento } from './mantenimiento-vehiculo.entity';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';

@Entity('vehiculos')
export class Vehiculo extends BaseAuditEntity {
  // ==================== IDENTIFICACIÓN ====================
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 50 })
  placa!: string;

  @Column({ 
    type: 'enum', 
    enum: TipoVehiculo,
    comment: 'Tipo de vehículo de la flota' 
  })
  tipo!: TipoVehiculo;

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
    enum: EstadoVehiculo,
    name: 'estado_actual',
    comment: 'Estado operacional actual'
  })
  estadoActual!: EstadoVehiculo;

  // ==================== INFORMACIÓN OPERATIVA ====================
  @Column({ type: 'date', name: 'fecha_adquisicion' })
  fechaAdquisicion!: Date;

  @Column({ type: 'int', unsigned: true, default: 0 })
  kilometraje!: number;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  // ==================== MANTENIMIENTO ====================
  @OneToMany(() => Mantenimiento, (m) => m.vehiculo, {
    cascade: false,
  })
  mantenimientos!: Mantenimiento[];
}