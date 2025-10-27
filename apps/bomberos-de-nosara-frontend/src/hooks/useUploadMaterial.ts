import { useState } from 'react';
import { materialService } from '../service/materialEducativoService';

export const useUploadMaterial = (onSuccess?: () => void) => {
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (formData: FormData) => {
    setIsUploading(true);
    try {
      await materialService.upload(formData);
      if (onSuccess) onSuccess(); 
    } catch (error) {
      console.error('Error al subir material:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading };
};

