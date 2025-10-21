import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EmergencyReport } from './emergency-report.entity';

@Entity('report_attachments')
export class ReportAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EmergencyReport, (report) => report.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'emergency_report_id' })
  emergencyReport: EmergencyReport;

  @Column({ name: 'emergency_report_id' })
  emergencyReportId: number;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'file_url', length: 500 })
  fileUrl: string;
}