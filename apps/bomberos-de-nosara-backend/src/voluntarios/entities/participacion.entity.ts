import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TipoActividad {
  ENTRENAMIENTO = 'Entrenamiento',
  EMERGENCIA = 'Emergencia',
  SERVICIO_COMUNITARIO = 'Servicio Comunitario',
}

@Entity('participaciones')
export class Participacion {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'voluntarioId' })
  voluntario!: User;

  @Column({ type: 'enum', enum: TipoActividad })
  actividad!: TipoActividad;

  @Column({ type: 'date' })
  fecha!: Date;

  @Column({ type: 'time' })
  horaInicio!: string;

  @Column({ type: 'time' })
  horaFin!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column()
  ubicacion!: string;

  @Column({ default: 'pendiente' })
  estado!: 'pendiente' | 'aprobada' | 'rechazada';

  @CreateDateColumn()
  fechaRegistro!: Date;

  @Column({ type: 'text', nullable: true })
  motivoRechazo?: string;
}
