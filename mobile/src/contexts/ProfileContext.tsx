import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Alert } from 'react-native';
import api from '../services/api';

type Address = {
  id: number;
  label: string;
  street: string;
  number: string;
  city: string;
  state: string;
};

type FavoriteService = {
  id: number;
  subcategory: {
    id: number;
    name: string;
    icon: string;
  };
};

type LoginActivity = {
  id: number;
  device: string;
  location: string | null;
  ipAddress: string | null;
  loginTime: string;
  isActive: boolean;
};

export type ProfileData = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  profileImage: string | null;
  rating: number;
  createdAt: string;
  address: Address | null;
  favorites: FavoriteService[];
};

type ProfileContextData = {
  profile: ProfileData | null;
  loginActivities: LoginActivity[];
  loadingProfile: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<Pick<ProfileData, 'name' | 'email' | 'phoneNumber' | 'profileImage'>>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  fetchLoginActivities: () => Promise<void>;
  endAllSessions: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextData>({} as ProfileContextData);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loginActivities, setLoginActivities] = useState<LoginActivity[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const { data } = await api.get('/users/me');
      setProfile(data);
    } catch {
      // silencioso — o perfil será null
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const updateProfile = async (updates: Partial<Pick<ProfileData, 'name' | 'email' | 'phoneNumber' | 'profileImage'>>) => {
    const { data } = await api.patch('/users/me', updates);
    setProfile((prev) => (prev ? { ...prev, ...data } : prev));
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await api.post('/users/me/change-password', { currentPassword, newPassword });
  };

  const fetchLoginActivities = useCallback(async () => {
    try {
      const { data } = await api.get('/users/me/login-activities');
      setLoginActivities(data);
    } catch {
      // silencioso
    }
  }, []);

  const endAllSessions = async () => {
    await api.delete('/users/me/sessions');
    setLoginActivities((prev) => prev.map((a) => ({ ...a, isActive: false })));
  };

  const deleteAccount = async () => {
    await api.delete('/users/me');
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loginActivities,
        loadingProfile,
        fetchProfile,
        updateProfile,
        changePassword,
        fetchLoginActivities,
        endAllSessions,
        deleteAccount,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
