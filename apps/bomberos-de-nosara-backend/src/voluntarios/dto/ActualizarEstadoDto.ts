import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class ActualizarEstadoDto {
  @IsIn(['aprobada', 'rechazada'])
  estado!: 'aprobada' | 'rechazada';

  @IsOptional()
  @IsString()
  @Length(5, 200, {
    message: 'El motivo de rechazo debe tener entre 5 y 200 caracteres.',
  })
  motivoRechazo?: string;
}
