import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IP da sua máquina na rede Wi-Fi (celular e PC devem estar na mesma rede)
const BASE_URL = 'http://192.168.15.7:3000';

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
