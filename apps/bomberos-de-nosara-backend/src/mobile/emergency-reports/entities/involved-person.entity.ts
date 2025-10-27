import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EmergencyReport } from './emergency-report.entity';

export enum PersonRole {
  VICTIM = 'VICTIM',
  WITNESS = 'WITNESS',
  RESPONSIBLE = 'RESPONSIBLE',
  OTHER = 'OTHER',
}

@Entity('involved_persons')
export class InvolvedPerson {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EmergencyReport, (report) => report.involvedPersons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'emergency_report_id' })
  emergencyReport: EmergencyReport;

  @Column({ name: 'emergency_report_id' })
  emergencyReportId: number;

  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column({
    type: 'enum',
    enum: PersonRole,
  })
  role: PersonRole;

  @Column({ type: 'varchar', length: 50, nullable: true })
phone: string | null;
}