import axios from 'axios';
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { Donante } from '../types/donate';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/donantes`;

// Función para obtener el token desde localStorage y agregarlo a los headers
const getAuthHeader = () => {
  try {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (error) {
    console.warn('No se pudo acceder al token:', error);
    return {};
  }
};

// Define the response type
export interface DonantesResponse {
  data: Donante[];
  total: number;
  page: number;
  limit: number;
}

// GET all with pagination and search
export const useDonantes = (page = 1, limit = 10, search = '') => {
  return useQuery<DonantesResponse>({
    queryKey: ['donantes', page, limit, search],
    queryFn: async () => {
      const res = await axios.get<DonantesResponse>(API_URL, {
        params: { 
          page, 
          limit,
          ...(search ? { search } : {}) // Only include search if it's not empty
        },
        headers: getAuthHeader(),
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  });
};

// POST
export const useAddDonante = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newDonante: {
      nombre: string;
      descripcion: string;
      url: string;
      logoFile: File;
    }) => {
      const formData = new FormData();
      formData.append('nombre', newDonante.nombre);
      formData.append('descripcion', newDonante.descripcion);
      formData.append('url', newDonante.url);
      formData.append('logo', newDonante.logoFile);

      await axios.post(API_URL, formData, {
        headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['donantes'] }),
  });
};



// PUT

export const useUpdateDonante = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Donante & { logoFile?: File }) => {
      const formData = new FormData();
      formData.append('nombre', String(payload.nombre));
      formData.append('descripcion', String(payload.descripcion));
      formData.append('url', String(payload.url));
      if (payload.logoFile) {
        formData.append('logo', payload.logoFile);  // opcional
      }

      await axios.put(`${API_URL}/${payload.id}`, formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donantes'] });
    },
  });
};


//DELETE
export const useDeleteDonante = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {            // ← number
      await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeader(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donantes'] });
    },
  });
};
