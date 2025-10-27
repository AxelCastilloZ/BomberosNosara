import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { MobileUser } from '../../mobile-users/entities/mobile-user.entity';
import { User } from '../../../users/entities/user.entity';

export enum ReportType {
  FIRE = 'FIRE',
  MEDICAL = 'MEDICAL',
  ACCIDENT = 'ACCIDENT',
  RESCUE = 'RESCUE',
  OTHER = 'OTHER',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

@Entity('emergency_reports')
export class EmergencyReport {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MobileUser, { nullable: false })
  @JoinColumn({ name: 'mobile_user_id' })
  mobileUser: MobileUser;

  @Column({ name: 'mobile_user_id' })
  mobileUserId: number;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  type: ReportType;

  @Column('decimal', { precision: 10, scale: 7 })
  latitud: number;

  @Column('decimal', { precision: 10, scale: 7 })
  longitud: number;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'first_response_at', type: 'timestamp', nullable: true })
  firstResponseAt: Date | null;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'closed_by' })
  closedByUser: User;

  @Column({ name: 'closed_by', nullable: true })
  closedBy: number | null;

  @Column({ type: 'text', nullable: true, name: 'incident_details' })
  incidentDetails: string | null;

  @Column({ type: 'text', nullable: true })
  recommendations: string | null;

  @OneToMany('InvolvedPerson', 'emergencyReport')
  involvedPersons: any[];

  @OneToMany('ReportAttachment', 'emergencyReport')
  attachments: any[];

  @OneToMany('StatusChange', 'emergencyReport')
  statusChanges: any[];
}