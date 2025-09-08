// src/equipo-bomberil/entities/equipo-bomberil.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { CatalogoEquipo } from './catalogo-equipo.entity';
import { EquipoMantenimiento } from './equipo-mantenimiento.entity';
import { MantenimientoProgramado } from './mantenimiento-programado.entity';
import { EstadoActual } from '../enums/equipo-bomberil.enums';

@Entity('equipo_bomberil')
export class EquipoBomberil {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  catalogoId!: string;

  @ManyToOne(() => CatalogoEquipo, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'catalogoId' })
  catalogo!: CatalogoEquipo;

  @Column({ type: 'date' })
  fechaAdquisicion!: string; // YYYY-MM-DD

  @Column({ type: 'varchar', length: 20 })
  estadoInicial!: 'nuevo' | 'usado';

  @Column({ type: 'enum', enum: EstadoActual, default: EstadoActual.DISPONIBLE })
  estadoActual!: EstadoActual;

  @Column({ type: 'varchar', length: 120, nullable: true })
  numeroSerie?: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  fotoUrl?: string;

  @Column({ type: 'int' })
  cantidad!: number;

  // ---- Campos para flujo de reposición (usados por tu servicio) ----
  @Column({ type: 'boolean', default: false })
  reposicionSolicitada!: boolean;

  @Column({ type: 'text', nullable: true })
  motivoReposicion?: string;

  @Column({ type: 'text', nullable: true })
  observacionesReposicion?: string;

  // ---- Relaciones (inversas) ----
  @OneToMany(() => EquipoMantenimiento, (m) => m.equipo)
  historial!: EquipoMantenimiento[];

  @OneToMany(() => MantenimientoProgramado, (p) => p.equipo)
  programados!: MantenimientoProgramado[];
}

