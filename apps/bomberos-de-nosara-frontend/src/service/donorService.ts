import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

// GET all
export const useDonantes = () => {
  return useQuery({
    queryKey: ['donantes'],
    queryFn: async (): Promise<Donante[]> => {
      const res = await axios.get(API_URL, {
        headers: getAuthHeader(),
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

// POST
export const useAddDonante = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newDonante: {
      id: string;
      nombre: string;
      descripcion: string;
      url: string;
      logoFile: File; //  Nuevo campo que pasaremos desde el formulario
    }) => {
      const formData = new FormData();
      formData.append('id', String (newDonante.id));
      formData.append('nombre', String (newDonante.nombre));
      formData.append('descripcion', String (newDonante.descripcion));
      formData.append('url', String (newDonante.url));
      formData.append('logo', newDonante.logoFile); //  Aquí subimos el archivo

      await axios.post(API_URL, formData, {
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


// PUT
export const useUpdateDonante = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (donante: Donante) => {
      await axios.put(`${API_URL}/${donante.id}`, donante, {
        headers: getAuthHeader(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donantes'] });
    },
  });
};

// DELETE
export const useDeleteDonante = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeader(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donantes'] });
    },
  });
};
