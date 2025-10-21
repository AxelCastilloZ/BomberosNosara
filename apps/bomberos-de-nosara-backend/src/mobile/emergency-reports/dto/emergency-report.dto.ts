import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  Min,
  Max,
} from 'class-validator';
import { ReportType, ReportStatus } from '../entities/emergency-report.entity';
import { PersonRole } from '../entities/involved-person.entity';

export class CreateEmergencyReportDto {
  @IsEnum(ReportType, { message: 'Invalid report type' })
  type: ReportType;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud: number;

  // ✅ NUEVO: Para endpoint anónimo
  @IsOptional()
  @IsNumber()
  mobileUserId?: number;
}

export class UpdateReportStatusDto {
  @IsEnum(ReportStatus, { message: 'Invalid status' })
  status: ReportStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CompleteReportDto {
  @IsString()
  @MinLength(50, { message: 'Incident details must be at least 50 characters' })
  incidentDetails: string;

  @IsOptional()
  @IsString()
  recommendations?: string;
}

export class AddInvolvedPersonDto {
  @IsString()
  @MinLength(3, { message: 'Full name must be at least 3 characters' })
  fullName: string;

  @IsEnum(PersonRole, { message: 'Invalid person role' })
  role: PersonRole;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateAttachmentDto {
  @IsString()
  @MinLength(1)
  fileName: string;

  @IsString()
  @MinLength(1)
  fileUrl: string;
}