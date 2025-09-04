
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { EquipoBomberil } from './equipo-bomberil.entity';


export enum TipoMantenimiento {
  PREVENTIVO = 'preventivo',
  CORRECTIVO = 'correctivo',
  INSPECCION = 'inspección',
}

export enum Prioridad {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
}

@Entity('equipo_mantenimiento_programado')
export class MantenimientoProgramado {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  equipoId!: string;

  @ManyToOne(() => EquipoBomberil, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'equipoId' })
  equipo!: EquipoBomberil;

  @Column({ type: 'date' })
  fechaProximoMantenimiento!: string; 

  @Column({ type: 'varchar', length: 150 })
  tecnico!: string;

  @Column({ type: 'enum', enum: TipoMantenimiento })
  tipo!: TipoMantenimiento;

  @Column({ type: 'enum', enum: Prioridad })
  prioridad!: Prioridad;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  // Puedes cambiarlo a enum si quieres estados estrictos
  @Column({ type: 'varchar', length: 20, default: 'pendiente' })
  estado!: 'pendiente' | 'realizado' | 'cancelado';

  @CreateDateColumn()
  createdAt!: Date;
}
