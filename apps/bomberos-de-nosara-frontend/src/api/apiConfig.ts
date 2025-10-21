
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


const isFormData = (v: unknown): v is FormData =>
  typeof FormData !== 'undefined' && v instanceof FormData;

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  
  const headers = AxiosHeaders.from(config.headers);

  // Token
  const token = localStorage.getItem('access_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  
  if (isFormData(config.data)) {
    headers.delete('Content-Type');
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
