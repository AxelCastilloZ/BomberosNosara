import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ReportType } from '../../mobile/emergency-reports/entities/emergency-report.entity';

export class StatisticsFiltersDto {
  @IsOptional()
  @IsDateString()
  startDate?: string; // formato: YYYY-MM-DD

  @IsOptional()
  @IsDateString()
  endDate?: string; // formato: YYYY-MM-DD

  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;
}