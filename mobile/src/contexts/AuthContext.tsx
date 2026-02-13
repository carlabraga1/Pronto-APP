import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

type User = {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'professional';
};

type AuthContextData = {
  user: User | null;
  signed: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const TOKEN_KEY = '@pronto:token';
const USER_KEY = '@pronto:user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Recupera sessão salva ao abrir o app
  useEffect(() => {
    async function loadStoredData() {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
      }

      setLoading(false);
    }

    loadStoredData();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await api.post('/auth/login', {
      email,
      password,
      role: 'client',
    });

    const { accessToken, user: userData } = response.data;

    await AsyncStorage.setItem(TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));

    setUser(userData);
  };

  const signUp = async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      role: 'client',
    });

    const { accessToken, user: userData } = response.data;

    await AsyncStorage.setItem(TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));

    setUser(userData);
  };

  const forgotPassword = async (email: string) => {
    await api.post('/auth/forgot-password', {
      email,
      role: 'client',
    });
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, signed: !!user, loading, signIn, signUp, forgotPassword, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
