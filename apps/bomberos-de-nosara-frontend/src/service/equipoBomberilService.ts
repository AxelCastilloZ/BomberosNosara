import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EquipoBomberil } from '../interfaces/EquipoBomberil/equipoBomberil';
import { ReposicionData } from '../interfaces/EquipoBomberil/reposicionData';
import { CatalogoEquipo } from '../interfaces/EquipoBomberil/catalogoEquipo';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/equipos-bomberiles`;

const getAuthHeader = () => {
  try {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (error) {
    console.warn('No se pudo acceder al token:', error);
    return {};
  }
};

// ✅ GET - Obtener todos los equipos
export const useEquiposBomberiles = () => {
  return useQuery({
    queryKey: ['equipos-bomberiles'],
    queryFn: async (): Promise<EquipoBomberil[]> => {
      const res = await axios.get(API_URL, {
        headers: getAuthHeader(),
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};

// ✅ GET - Obtener catálogo de tipos de equipo
export const useCatalogos = () => {
  return useQuery({
    queryKey: ['catalogo-equipo'],
    queryFn: async (): Promise<CatalogoEquipo[]> => {
      const res = await axios.get(`${API_URL}/catalogo`, {
        headers: getAuthHeader(),
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
  });
};

// ✅ POST - Crear nuevo equipo
export const useAddEquipoBomberil = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nuevoEquipo: Omit<EquipoBomberil, 'id' | 'catalogo'> & { catalogoId: string }) => {
      await axios.post(API_URL, nuevoEquipo, {
        headers: getAuthHeader(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipos-bomberiles'] });
    },
    onError: (error) => {
      console.error('Error al registrar equipo:', error);
      alert('Error al registrar el equipo. Revisa los campos e intenta de nuevo.');
    },
  });
};

// ✅ PUT - Actualizar estado actual solamente
export const useActualizarEstadoActual = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, estadoActual }: { id: string; estadoActual: string }) => {
      await axios.put(`${API_URL}/${id}`, { estadoActual }, {
        headers: getAuthHeader(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipos-bomberiles'] });
    },
    onError: (err) => {
      console.error('Error actualizando estado:', err);
      alert('No se pudo actualizar el estado.');
    },
  });
};

// ✅ PUT - Actualizar equipo existente
export const useUpdateEquipoBomberil = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (equipo: Partial<EquipoBomberil> & { id: string; catalogoId: string }) => {
      const { id, ...data } = equipo;
      await axios.put(`${API_URL}/${id}`, data, {
        headers: getAuthHeader(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipos-bomberiles'] });
    },
  });
};

// ✅ DELETE - Eliminar equipo
export const useDeleteEquipoBomberil = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeader(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipos-bomberiles'] });
    },
  });
};

// ✅ POST - Agregar nuevo catálogo
export const useAddCatalogoEquipo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nuevoCatalogo: { nombre: string; tipo: 'terrestre' | 'marítimo' }) => {
      await axios.post(`${import.meta.env.VITE_API_URL}/equipos-bomberiles/catalogo`, nuevoCatalogo, {
        headers: getAuthHeader(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo-equipo'] });
    },
  });
};

export const useDarDeBaja = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      cantidad,
    }: {
      id: string;
      cantidad: number;
    }) => {
      await axios.patch(
        `${API_URL}/${id}/dar-de-baja`,
        { cantidad },
        {
          headers: getAuthHeader(),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipos-bomberiles'] });
    },
    onError: (err) => {
      console.error('Error al dar de baja:', err);
      alert('No se pudo dar de baja el equipo.');
    },
  });
};


// ✅ POST - Registrar reposición
export const useRegistrarReposicion = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ReposicionData }) => {
      await axios.post(`${API_URL}/${id}/reposicion`, data, {
        headers: getAuthHeader(),
      });
    },
  });
};
