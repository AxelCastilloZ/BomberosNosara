import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { EmergencyReport } from '../../../mobile/emergency-reports/entities/emergency-report.entity';

@Entity('mobile_users')
export class MobileUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  deviceId!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ default: true })
  isAnonymous!: boolean;

  @Column({ type: 'json', nullable: true })
  deviceInfo?: {
    platform: string;
    model?: string;
    osVersion?: string;
    appVersion?: string;
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => EmergencyReport, report => report.mobileUser)
  reports!: EmergencyReport[];
}