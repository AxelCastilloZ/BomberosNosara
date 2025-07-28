// src/equipo-bomberil/entities/equipo-bomberil.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EstadoActual, EstadoInicial } from '../enums/equipo-bomberil.enums';
import { CatalogoEquipo } from './catalogo-equipo.entity';

@Entity('equipos_bomberiles')
export class EquipoBomberil {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => CatalogoEquipo, { eager: true })
  @JoinColumn({ name: 'catalogoId' })
  catalogo!: CatalogoEquipo;

  @Column()
  catalogoId!: string;

  @Column()
  fechaAdquisicion!: string;

  @Column({ type: 'enum', enum: EstadoInicial })
  estadoInicial!: EstadoInicial;

  @Column({ type: 'enum', enum: EstadoActual })
  estadoActual!: EstadoActual;

  @Column({ nullable: true })
  numeroSerie?: string;

  @Column({ nullable: true })
  fotoUrl?: string;

  @Column({ default: false })
  reposicionSolicitada!: boolean;

  @Column({ nullable: true })
  motivoReposicion?: string;

  @Column({ nullable: true })
  observacionesReposicion?: string;

  @Column({ type: 'int', default: 1 })
  cantidad!: number;
}
