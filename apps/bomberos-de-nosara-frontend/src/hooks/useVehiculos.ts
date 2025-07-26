import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiculoService } from '../service/vehiculoService';
import type { MantenimientoData, MantenimientoProgramadoData, Vehicle } from '../interfaces/Vehiculos/vehicle';
import type { ReposicionData } from '../interfaces/Vehiculos/vehicle';
import { string } from 'yup';

// Obtener todos los vehículos
export const useVehiculos = () => {
  return useQuery({
    queryKey: ['vehiculos'],
    queryFn: vehiculoService.getAll,
    staleTime: 1000 * 60 * 10, // === 10 minutos
  });
};

// Agregar vehículo
export const useAddVehiculo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vehiculoService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehiculos'] }),
  });
};

// Actualizar vehículo
export const useUpdateVehiculo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vehiculoService.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehiculos'] }),
  });
};

// Cambiar estado actual
export const useActualizarEstadoVehiculo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estadoActual }: { id: string; estadoActual: Vehicle['estadoActual'] }) =>
      vehiculoService.updateEstado(id, estadoActual),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehiculos'] }),
  });
};

// Dar de baja
export const useDarDeBajaVehiculo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      vehiculoService.darDeBaja(id, motivo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehiculos'] }),
  });
};

// Solicitar reposición
export const useRegistrarReposicionVehiculo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReposicionData }) =>
      vehiculoService.registrarReposicion(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehiculos'] }),
  });
};


export const useRegistrarMantenimiento = ()=>{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id,data}: {id: string; data:MantenimientoData})=>
            vehiculoService.registrarMantenimiento(id,data),
        onSuccess: () =>{
            queryClient.invalidateQueries({queryKey: ['vehiculos']});
        },
    });
};






export const useProgramarMantenimiento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MantenimientoProgramadoData }) =>
      vehiculoService.programarMantenimiento(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
    },
  });
};





