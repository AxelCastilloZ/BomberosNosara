import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ReportStatus } from '../enums/report-status.enum';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: ['fire','accident','rescue','other'] })
  type!: 'fire' | 'accident' | 'rescue' | 'other';

  @Column('decimal', { precision: 10, scale: 6 })
  lat!: number;

  @Column('decimal', { precision: 10, scale: 6 })
  lng!: number;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status!: ReportStatus;

  @CreateDateColumn()
  createdAt!: Date;
}
