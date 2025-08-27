// src/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true }) // <— nuevo
  email!: string; // <— nuevo

  @Column()
  password!: string;

  @ManyToMany(() => Role, { eager: true })
  @JoinTable()
  roles!: Role[];
}
