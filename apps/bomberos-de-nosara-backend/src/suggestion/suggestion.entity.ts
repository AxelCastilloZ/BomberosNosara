import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sugerencia')
export class Sugerencia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column()
  email!: string;

  @Column()
  telefono!: string;

  @Column('text')
  contenido!: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha!: Date;
}