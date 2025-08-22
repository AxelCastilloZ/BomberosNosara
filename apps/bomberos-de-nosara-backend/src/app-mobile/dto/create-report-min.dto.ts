import { IsEnum, IsNumber } from 'class-validator';

export class CreateReportMinDto {
  @IsEnum(['fire', 'accident', 'rescue', 'other'] as const)
  type!: 'fire' | 'accident' | 'rescue' | 'other';

  @IsNumber() lat!: number;
  @IsNumber() lng!: number;
}
