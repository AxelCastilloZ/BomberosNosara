// src/api/apiConfig.ts  (o donde tengas tu instancia)
import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  timeout: 30000,
  withCredentials: false,
});

// Helper para detectar FormData sin romper en SSR/tests
const isFormData = (v: unknown): v is FormData =>
  typeof FormData !== 'undefined' && v instanceof FormData;

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Aseguramos headers como AxiosHeaders
  const headers = AxiosHeaders.from(config.headers);

  // Token
  const token = localStorage.getItem('access_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Si mandamos FormData, dejá que el navegador ponga el boundary.
  if (isFormData(config.data)) {
    headers.delete('Content-Type'); // también elimina la variante case-insensitive
  }

  config.headers = headers;
  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  (err: AxiosError) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('authUser');
    }
    return Promise.reject(err);
  }
);

export default api;
