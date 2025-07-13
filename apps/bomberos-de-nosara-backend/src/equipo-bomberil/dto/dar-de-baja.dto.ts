
import { IsInt, Min } from 'class-validator';

export class DarDeBajaDto {
  @IsInt()
  @Min(1)
  cantidad!: number;
}
