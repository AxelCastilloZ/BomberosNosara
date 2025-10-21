import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Ajusta la ruta si cambia

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

  @Column({ nullable: true })
  area?: string;

  // === Auditoría de usuario ===
  @Column({ name: 'created_by', type: 'int' })
  createdBy!: number;

  @Column({ name: 'updated_by', type: 'int' })
  updatedBy!: number;

  @Column({ name: 'deleted_by', type: 'int', nullable: true })
  deletedBy?: number | null;

  // 👇 Este se cargará automáticamente al consultar el material
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by' })
  createdByUser!: User;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'updated_by' })
  updatedByUser!: User;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'deleted_by' })
  deletedByUser?: User;

  // === Fechas ===
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}
