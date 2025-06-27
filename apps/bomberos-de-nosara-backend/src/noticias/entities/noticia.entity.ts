import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('noticias')
export class Noticia {
  @PrimaryGeneratedColumn('uuid') //para generar los id automaticos
  id!: string;

  @Column()
  titulo!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ length: 1000 })
  url!: string;

  @Column()
  fecha!: string;
}
