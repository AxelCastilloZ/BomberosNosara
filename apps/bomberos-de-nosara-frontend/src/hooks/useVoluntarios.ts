// useVoluntarios.ts - VERSIÓN COMPLETA CON DEBUG
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { voluntariadoService } from '../service/voluntariosService';
import { CreateParticipacionDto, UpdateEstadoDto } from '../types/voluntarios';
import { AxiosError } from 'axios';

export const useMisParticipaciones = (estado?: string) =>
  useQuery({
    queryKey: ['mis-participaciones', estado],
    queryFn: () => voluntariadoService.listarMisParticipaciones(estado).then((r) => r.data),
  });

// useVoluntarios.ts - SIN MAPEO
export const useTodasParticipaciones = (estado?: string) =>
  useQuery({
    queryKey: ['participaciones', estado],
    queryFn: () => voluntariadoService.listarTodas(estado).then((r) => r.data),
  });

export const useHorasAprobadas = () =>
  useQuery({
    queryKey: ['mis-horas'],
    queryFn: () => voluntariadoService.obtenerHorasAprobadas().then((r) => r.data.horasAprobadas),
  });

export const useCrearParticipacion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateParticipacionDto) => {
      console.log('🔍 Enviando petición con:', dto);
      try {
        const response = await voluntariadoService.crear(dto);
        console.log('✅ Respuesta del backend:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Error en la petición:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidando queries de participaciones y horas...');
      qc.invalidateQueries({ queryKey: ['mis-participaciones'] });
      qc.invalidateQueries({ queryKey: ['mis-horas'] });
      console.log('✅ Queries invalidadas');
    },
    onError: (error: AxiosError | Error) => {
      console.error('❌ Error completo:', error);
      
      if ('response' in error) {
        const axiosError = error as AxiosError;
        console.error('❌ Status:', axiosError.response?.status);
        console.error('❌ Data:', axiosError.response?.data);
        console.error('❌ Headers:', axiosError.response?.headers);
        console.error('❌ Message:', axiosError.message);
      } else {
        console.error('❌ Error genérico:', error.message);
      }
    }
  });
};

export const useActualizarEstado = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateEstadoDto }) =>
      voluntariadoService.actualizarEstado(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['participaciones'] });
      qc.invalidateQueries({ queryKey: ['mis-participaciones'] });
      qc.invalidateQueries({ queryKey: ['mis-horas'] });
    },
  });
};