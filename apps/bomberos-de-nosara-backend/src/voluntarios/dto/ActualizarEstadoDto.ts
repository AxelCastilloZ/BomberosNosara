import { IsIn, IsOptional, IsString } from 'class-validator';

export class ActualizarEstadoDto {
  @IsIn(['aprobada', 'rechazada'])
  estado!: 'aprobada' | 'rechazada';

  @IsOptional()
  @IsString()
  motivoRechazo?: string;
}
