
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
 ManyToOne
} from 'typeorm';
import { Vehiculo } from './vehiculo.entity';




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

  @CreateDateColumn()
  createdAt!: Date;
}
