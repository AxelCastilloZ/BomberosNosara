
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { EquipoBomberil } from './equipo-bomberil.entity';

@Entity('equipo_mantenimiento')
export class EquipoMantenimiento {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  equipoId!: string;

 
  @ManyToOne(() => EquipoBomberil, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'equipoId' })
  equipo!: EquipoBomberil;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ type: 'varchar', length: 300 })
  descripcion!: string;

  @Column({ type: 'varchar', length: 150 })
  tecnico!: string;


  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  costo?: string;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
