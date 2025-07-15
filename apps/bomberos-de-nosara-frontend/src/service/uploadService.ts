import axios from 'axios';

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/upload/uploadImage`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Error al subir la imagen');
  }
};