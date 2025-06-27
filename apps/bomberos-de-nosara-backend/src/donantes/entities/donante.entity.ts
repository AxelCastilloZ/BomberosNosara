import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('donantes')
export class Donante {
  @PrimaryColumn()
  id: string;

  @Column()
  nombre: string;

  @Column({ type: 'text' })
  descripcion: string;

 @Column({ length: 1000 })
logo: string;

@Column({ length: 1000 })
url: string;

}
