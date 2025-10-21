import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('material_educativo')
export class MaterialEducativo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  titulo!: string;

  @Column()
  descripcion!: string;

  @Column()
  tipo!: string;

  @Column()
  url!: string;

  @Column({ nullable: true })
  vistaPrevia?: string;
}
