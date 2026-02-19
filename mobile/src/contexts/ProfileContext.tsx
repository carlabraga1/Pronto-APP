import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Alert } from 'react-native';
import api from '../services/api';

export type Address = {
  id: number;
  label: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
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

type CreateAddressData = Omit<Address, 'id' | 'isDefault'>;

type ProfileContextData = {
  profile: ProfileData | null;
  addresses: Address[];
  loginActivities: LoginActivity[];
  loadingProfile: boolean;
  loadingAddresses: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<Pick<ProfileData, 'name' | 'email' | 'phoneNumber' | 'profileImage'>>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  fetchLoginActivities: () => Promise<void>;
  endAllSessions: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  fetchAddresses: () => Promise<void>;
  createAddress: (data: CreateAddressData) => Promise<void>;
  updateAddress: (id: number, data: Partial<CreateAddressData>) => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
  setDefaultAddress: (id: number) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextData>({} as ProfileContextData);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loginActivities, setLoginActivities] = useState<LoginActivity[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

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

  // ─── ADDRESSES ──────────────────────────────────────────────

  const fetchAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    try {
      const { data } = await api.get('/users/me/addresses');
      setAddresses(data);
    } catch {
      // silencioso
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  const createAddress = async (addressData: CreateAddressData) => {
    const { data } = await api.post('/users/me/addresses', addressData);
    setAddresses((prev) => {
      if (data.isDefault) {
        return [data, ...prev.map((a: Address) => ({ ...a, isDefault: false }))];
      }
      return [...prev, data];
    });
    await fetchProfile();
  };

  const updateAddress = async (id: number, addressData: Partial<CreateAddressData>) => {
    const { data } = await api.patch(`/users/me/addresses/${id}`, addressData);
    setAddresses((prev) => prev.map((a) => (a.id === id ? data : a)));
    await fetchProfile();
  };

  const deleteAddress = async (id: number) => {
    await api.delete(`/users/me/addresses/${id}`);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    await fetchProfile();
  };

  const setDefaultAddress = async (id: number) => {
    const { data } = await api.patch(`/users/me/addresses/${id}/default`);
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      })),
    );
    await fetchProfile();
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        addresses,
        loginActivities,
        loadingProfile,
        loadingAddresses,
        fetchProfile,
        updateProfile,
        changePassword,
        fetchLoginActivities,
        endAllSessions,
        deleteAccount,
        fetchAddresses,
        createAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
