
import api from '../api/apiConfig';
import type { AxiosError } from 'axios';
import type { CatalogoEquipo } from '../interfaces/EquipoBomberil/catalogoEquipo';
import type {
  EquipoBomberil,
  EquipoMantenimiento,
  EquipoMantenimientoProgramado,
  NuevoMantenimientoDTO,             
} from '../interfaces/EquipoBomberil/equipoBomberil';


export type CreateEquipoBomberilInput = {
  catalogoId: string;
  fechaAdquisicion: string; 
  estadoInicial: 'nuevo' | 'usado';
  estadoActual: 'disponible' | 'en mantenimiento' | 'dado de baja';
  numeroSerie?: string;
  fotoUrl?: string;
  cantidad: number;
};

type ApiErrorPayload = {
  code?: string;
  field?: string;
  message?: string;
  details?: any;
  statusCode?: number;
};

function normalizeApiError(err: unknown): never {
  const axErr = err as AxiosError<ApiErrorPayload>;
  const payload = axErr?.response?.data;
  if (payload?.message || payload?.code) {
    const e = new Error(payload.message || 'Error de servidor');
    (e as any).code = payload.code;
    (e as any).field = payload.field;
    (e as any).status = axErr?.response?.status;
    (e as any).raw = payload;
    throw e;
  }
  const e = new Error(axErr?.message || 'Error de red o del servidor');
  (e as any).status = axErr?.response?.status;
  throw e;
}

export const equipoBomberilService = {
  async getAll(): Promise<EquipoBomberil[]> {
    try {
      const res = await api.get<EquipoBomberil[]>('/equipos-bomberiles');
      return res.data;
    } catch (err) { normalizeApiError(err); }
  },

  async create(equipo: CreateEquipoBomberilInput): Promise<EquipoBomberil> {
    try {
      const res = await api.post<EquipoBomberil>('/equipos-bomberiles', equipo);
      return res.data;
    } catch (err) { normalizeApiError(err); }
  },

  async update(equipo: Partial<EquipoBomberil> & { id: string }): Promise<EquipoBomberil> {
    try {
      const { id, ...data } = equipo;
      const res = await api.put<EquipoBomberil>(`/equipos-bomberiles/${id}`, data);
      return res.data;
    } catch (err) { normalizeApiError(err); }
  },

  async updateEstado(id: string, estadoActual: EquipoBomberil['estadoActual']): Promise<EquipoBomberil> {
    try {
      const res = await api.put<EquipoBomberil>(`/equipos-bomberiles/${id}`, { estadoActual });
      return res.data;
    } catch (err) { normalizeApiError(err); }
  },

  async delete(id: string): Promise<{ success: true }> {
    try {
      const res = await api.delete<{ success: true }>(`/equipos-bomberiles/${id}`);
      return res.data;
    } catch (err) { normalizeApiError(err); }
  },

  async getCatalogos(): Promise<CatalogoEquipo[]> {
    try {
      const res = await api.get<CatalogoEquipo[]>('/equipos-bomberiles/catalogo');
      return res.data;
    } catch (err) { normalizeApiError(err); }
  },

  async addCatalogo(catalogo: { nombre: string; tipo: CatalogoEquipo['tipo'] }): Promise<CatalogoEquipo> {
    try {
      const res = await api.post<CatalogoEquipo>('/equipos-bomberiles/catalogo', catalogo);
      return res.data;
    } catch (err) { normalizeApiError(err); }
  },

  async darDeBaja(id: string, cantidad: number): Promise<EquipoBomberil> {
    try {
      const res = await api.patch<EquipoBomberil>(`/equipos-bomberiles/${id}/dar-de-baja`, { cantidad });
      return res.data;
    } catch (err) { normalizeApiError(err); }
  },


  async registrarMantenimiento(id: string, data: NuevoMantenimientoDTO): Promise<EquipoMantenimiento> {
    try {
   
      const res = await api.post<EquipoMantenimiento>(`/equipos-bomberiles/${id}/historial`, data);
      return res.data;
    } catch (err) { normalizeApiError(err); }
  },

  
  async programarMantenimiento(id: string, data: EquipoMantenimientoProgramado): Promise<EquipoMantenimientoProgramado> {
    try {
      const res = await api.put<EquipoMantenimientoProgramado>(`/equipos-bomberiles/${id}/mantenimiento`, data);
      return res.data;
    } catch (err) { normalizeApiError(err); }
  },

  async getHistorial(id: string): Promise<EquipoMantenimiento[]> {
    try {
      const res = await api.get<EquipoMantenimiento[]>(`/equipos-bomberiles/${id}/historial`);
      return res.data;
    } catch (err) { normalizeApiError(err); }
  },
};
