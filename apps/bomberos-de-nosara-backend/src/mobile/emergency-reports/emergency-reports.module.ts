import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmergencyReportsController } from './emergency-reports.controller';
import { EmergencyReportsService } from './emergency-reports.service';
import { EmergencyReport } from './entities/emergency-report.entity';
import { StatusChange } from './entities/status-change.entity';
import { InvolvedPerson } from './entities/involved-person.entity';
import { ReportAttachment } from './entities/report-attachment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmergencyReport,
      StatusChange,
      InvolvedPerson,
      ReportAttachment,
    ]),
  ],
  controllers: [EmergencyReportsController],
  providers: [EmergencyReportsService],
  exports: [EmergencyReportsService],
})
export class EmergencyReportsModule {}