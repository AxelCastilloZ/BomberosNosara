
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { RoleEnum } from '../role.enum';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: RoleEnum; 
}
