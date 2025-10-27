import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { EmergencyReport, ReportStatus } from './emergency-report.entity';
import { User } from '../../../users/entities/user.entity';

@Entity('status_changes')
export class StatusChange {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EmergencyReport, (report) => report.statusChanges, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'emergency_report_id' })
  emergencyReport: EmergencyReport;

  @Column({ name: 'emergency_report_id' })
  emergencyReportId: number;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    name: 'from_status',
  })
  fromStatus: ReportStatus;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    name: 'to_status',
  })
  toStatus: ReportStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by' })
  changedByUser: User;

  @Column({ name: 'changed_by' })
  changedBy: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'changed_at' })
  changedAt: Date;
}