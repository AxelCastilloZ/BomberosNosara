import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('noticias')
export class Noticia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  titulo!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ length: 1000 })
  url!: string;

  @Column()
  fecha!: string;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
