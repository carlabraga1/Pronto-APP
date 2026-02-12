import { createContext, useContext, useState, ReactNode } from 'react';

type User = {
  name: string;
  email: string;
};

type AuthContextData = {
  user: User | null;
  signed: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, _password: string) => {
    setLoading(true);
    // Simula chamada API
    await new Promise((r) => setTimeout(r, 1200));
    setUser({ name: 'Usuário Pronto', email });
    setLoading(false);
  };

  const signUp = async (name: string, email: string, _password: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setUser({ name, email });
    setLoading(false);
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, signed: !!user, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
