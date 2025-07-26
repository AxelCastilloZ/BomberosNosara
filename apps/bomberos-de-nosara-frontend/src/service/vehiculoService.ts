import api from '../api/apiConfig';
import type {
  MantenimientoProgramadoData,
  MantenimientoData,
  Vehicle,
  ReposicionData,
} from '../interfaces/Vehiculos/vehicle';

export const vehiculoService = {
  getAll: async (): Promise<Vehicle[]> => {
    const res = await api.get('/vehiculos');
    return res.data;
  },

  create: async (vehiculo: Omit<Vehicle, 'id'>) => {
  const res = await api.post('/vehiculos', vehiculo);
  return res.data; 
},


  update: async (vehiculo: Partial<Vehicle> & { id: string }) => {
    const { id, ...data } = vehiculo;
    return await api.put(`/vehiculos/${id}`, data);
  },

  updateEstado: async (id: string, estadoActual: Vehicle['estadoActual']) => {
    return await api.put(`/vehiculos/${id}/estado`, { estadoActual });
  },

  delete: async (id: string) => {
    return await api.delete(`/vehiculos/${id}`);
  },

  darDeBaja: async (id: string, motivo: string) => {
    return await api.patch(`/vehiculos/${id}/dar-de-baja`, { motivo });
  },

  registrarReposicion: async (id: string, data: ReposicionData) => {
    return await api.post(`/vehiculos/${id}/reposicion`, data);
  },

  registrarMantenimiento: async (id: string, data: MantenimientoData) => {
    return await api.post(`/vehiculos/${id}/historial`, data);
  },

  programarMantenimiento: (id: string, data: MantenimientoProgramadoData) => {
    return api.put(`/vehiculos/${id}/mantenimiento`, data);
  },

  getHistorial: async (id: string) => {
    const res = await api.get(`/vehiculos/${id}/historial`);
    return res.data;
  },
};
