import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { EstadoVehiculo, TipoVehiculo } from '../../vehiculos/enums/vehiculo-bomberil.enums';
import { Mantenimiento } from './mantenimiento-vehiculo.entity';

@Entity('vehiculos')
export class Vehiculo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  placa!: string;

  @Column({ type: 'enum', enum: TipoVehiculo })
  tipo!: TipoVehiculo;

  @Column()
  estadoInicial!: 'nuevo' | 'usado';

  @Column({ type: 'enum', enum: EstadoVehiculo })
  estadoActual!: EstadoVehiculo;

  @Column({ type: 'date' })
  fechaAdquisicion!: Date;

  @Column()
  kilometraje!: number;

  @Column({ nullable: true })
  fotoUrl?: string;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @Column({ default: false })
  reposicionSolicitada!: boolean;

  @Column({ type: 'text', nullable: true })
  motivoReposicion?: string;

  @Column({ type: 'text', nullable: true })
  observacionesReposicion?: string;

  @Column({ type: 'date', nullable: true })
  fechaProximoMantenimiento?: Date;

  @OneToMany(() => Mantenimiento, (mantenimiento: Mantenimiento) => mantenimiento.vehiculo)
  mantenimientos!: Mantenimiento[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
