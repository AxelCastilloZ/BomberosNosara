
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('catalogo_equipo')
export class CatalogoEquipo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  nombre!: string; 

  @Column({ type: 'enum', enum: ['terrestre', 'marítimo'] })
  tipo!: 'terrestre' | 'marítimo';
}
