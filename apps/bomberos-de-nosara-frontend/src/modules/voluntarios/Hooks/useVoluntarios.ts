// useVoluntarios.ts - VERSIÓN COMPLETA CON DEBUG
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { voluntariadoService } from '../../voluntarios/services/voluntariosService';
import { CreateParticipacionDto, EstadisticasVoluntariosDto, PaginatedDto, UpdateEstadoDto } from '../../voluntarios/types/voluntarios';

// Hook para ver el historial de participaciones del voluntario  -- to delete
export const useMisParticipaciones = (estado?: string) =>
  useQuery({
    queryKey: ['mis-participaciones', estado],
    queryFn: () => voluntariadoService.listarMisParticipaciones(estado).then((r) => r.data),
  });

  // Hook para obtener mis participaciones paginadas (voluntario)
  export const useMisParticipacionesPaginadas = (filtros: PaginatedDto) =>
  useQuery({
    queryKey: ['mis-participaciones-paginado', filtros],
    queryFn: () => voluntariadoService.listarMisParticipacionesPaginadas(filtros),
  });

// Hook para obtener horas aprobadas
export const useHorasAprobadas = () =>
  useQuery({
    queryKey: ['mis-horas'],
    queryFn: () => voluntariadoService.obtenerHorasAprobadas().then((r) => r.data.horasAprobadas),
  });

// Hook para obtener horas pendientes
export const useHorasPendientes = () =>
  useQuery({
    queryKey: ['mis-horas-pendientes'],
    queryFn: () => voluntariadoService.obtenerHorasPendientes().then((r) => r.data.horasPendientes),
  });

// Hook para crear una nueva participación
export const useCrearParticipacion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateParticipacionDto) => voluntariadoService.crear(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mis-participaciones-paginado'] });
      qc.invalidateQueries({ queryKey: ['mis-horas'] });
      qc.invalidateQueries({ queryKey: ['mis-horas-pendientes'] });
    },
  });
};

// Hook para actualizar el estado de una participación (admin)
export const useActualizarEstado = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateEstadoDto }) =>
      voluntariadoService.actualizarEstado(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['participaciones'] });
      qc.invalidateQueries({ queryKey: ['mis-participaciones'] });
      qc.invalidateQueries({ queryKey: ['mis-horas'] });
      qc.invalidateQueries({ queryKey: ['participaciones-paginado'] });
      qc.invalidateQueries({ queryKey: ['estadisticas-voluntarios'] });
      qc.invalidateQueries({ queryKey: ['estadisticasMensuales'] });
      qc.invalidateQueries({ queryKey: ['mis-participaciones-paginado'] });
      qc.invalidateQueries({ queryKey: ['mis-horas-pendientes'] });
    },
  });
};

// Hook para obtener estadísticas generales (admin)
export const useEstadisticasVolGenerales = () =>
  useQuery<EstadisticasVoluntariosDto>({
    queryKey: ['estadisticas-voluntarios'],
    queryFn: () => voluntariadoService.obtenerEstadisticasGenerales(),
    staleTime: 1000 * 60, // 1 minuto cahe
  });

// Hook para obtener estadísticas mensuales (admin)
  export const useEstadisticasVolMensuales = (mes: string) =>
  useQuery({
    queryKey: ['estadisticasMensuales', mes],
    queryFn: () => voluntariadoService.obtenerEstadisticasMensuales(mes),
    staleTime: 0, //para que se actualice al cambiar mes
  });

// Hook para obtener participaciones paginadas (admin)
  export const useParticipacionesPaginadas = (filtros: PaginatedDto) =>
  useQuery({
    queryKey: ['participaciones-paginado', filtros],
    queryFn: () => voluntariadoService.listarPaginado(filtros),
  });

  
  
