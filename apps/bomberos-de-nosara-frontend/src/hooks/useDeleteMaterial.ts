import { useState } from 'react';
import { materialService } from '../service/materialEducativoService';

export const useDeleteMaterial = (onSuccess?: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const remove = async (id: number) => {
    setIsDeleting(true);
    try {
      await materialService.delete(id);
      onSuccess?.();
    } catch (err) {
      console.error('Error eliminando material:', err);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return { remove, isDeleting };
};
