import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { EmergencyReport } from '../mobile/emergency-reports/entities/emergency-report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmergencyReport]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}