import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';

// In local dev, Vite's dev-server proxy forwards "/api" to localhost:4000 (see vite.config.ts).
// In production, there's no such proxy, so we point straight at the deployed API URL instead.
const baseURL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);