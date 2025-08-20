import { useState } from 'react';
import { materialService } from '../service/materialEducativoService';
import type { MaterialTipo } from '../interfaces/MaterialEducativo/material.interface';

export const useUpdateMaterial = (onSuccess?: () => void) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const update = async (
    id: number,
    data: { titulo: string; descripcion: string; tipo: MaterialTipo }
  ) => {
    setIsUpdating(true);
    try {
      await materialService.update(id, data);
      onSuccess?.();
    } finally {
      setIsUpdating(false);
    }
  };

  const updateWithFile = async (
    id: number,
    data: { titulo: string; descripcion: string; tipo: MaterialTipo; archivo: File }
  ) => {
    setIsUpdating(true);
    try {
      const fd = new FormData();
      fd.append('titulo', data.titulo);
      fd.append('descripcion', data.descripcion);
      fd.append('tipo', data.tipo);
      fd.append('archivo', data.archivo);
      await materialService.updateWithFile(id, fd);
      onSuccess?.();
    } finally {
      setIsUpdating(false);
    }
  };

  return { update, updateWithFile, isUpdating };
};
