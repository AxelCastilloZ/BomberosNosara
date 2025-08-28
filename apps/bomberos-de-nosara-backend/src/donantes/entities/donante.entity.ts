import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('donantes')
export class Donante {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column()
  nombre!: string;

  @Column({ type: 'text' })
  descripcion!: string;

 @Column({ length: 1000, nullable: true  })
  logo!: string;

@Column({ length: 1000})
url!: string;

}
