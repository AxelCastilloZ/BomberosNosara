import api from '../api/apiConfig';
import type {  CatalogoEquipo } from '../interfaces/EquipoBomberil/catalogoEquipo';
import type { EquipoBomberil } from '../interfaces/EquipoBomberil/equipoBomberil';
import type {  ReposicionData } from '../interfaces/EquipoBomberil/reposicionData';


export const equipoBomberilService = {
  getAll: async (): Promise<EquipoBomberil[]> => {
    const res = await api.get('/equipos-bomberiles');
    return res.data;
  },

  create: async (equipo: Omit<EquipoBomberil, 'id' | 'catalogo'>) => {
    return await api.post('/equipos-bomberiles', equipo);
  },

  update: async (equipo: Partial<EquipoBomberil> & { id: string }) => {
    const { id, ...data } = equipo;
    return await api.put(`/equipos-bomberiles/${id}`, data);
  },

  updateEstado: async (id: string, estadoActual: EquipoBomberil['estadoActual']) => {
    return await api.put(`/equipos-bomberiles/${id}`, { estadoActual });
  },

  delete: async (id: string) => {
    return await api.delete(`/equipos-bomberiles/${id}`);
  },

  getCatalogos: async (): Promise<CatalogoEquipo[]> => {
    const res = await api.get('/equipos-bomberiles/catalogo');
    return res.data;
  },

  addCatalogo: async (catalogo: { nombre: string; tipo: CatalogoEquipo['tipo'] }) => {
    return await api.post('/equipos-bomberiles/catalogo', catalogo);
  },

  darDeBaja: async (id: string, cantidad: number) => {
    return await api.patch(`/equipos-bomberiles/${id}/dar-de-baja`, { cantidad });
  },

  registrarReposicion: async (id: string, data: ReposicionData) => {
    return await api.post(`/equipos-bomberiles/${id}/reposicion`, data);
  }
};
