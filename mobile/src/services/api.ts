import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL do backend local via ngrok HTTPS
export const BASE_URL = 'https://unlibellous-cacodaemonic-edwina.ngrok-free.dev';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Interceptor para adicionar token JWT em todas as requisições
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@pronto:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
