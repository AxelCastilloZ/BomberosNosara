
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { RoleEnum } from '../role.enum';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ 
    type: 'enum',
    enum: RoleEnum,
    unique: true 
  })
  name!: RoleEnum; 
}