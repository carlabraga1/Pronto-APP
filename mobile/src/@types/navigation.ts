export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type RootStackParamList = {
  Tabs: { address?: string };
  Location: { returnTo?: 'AddAddress' } | undefined;
  SubCategory: { categoryId: number; categoryName: string; categoryIcon: string };
  EditProfile: undefined;
  PrivacyPolicy: undefined;
  OrderDetail: { orderId: string };
  CreateOrder: { service: string; categoryId: number; categoryName: string; categoryIcon?: string; subcategoryId?: number };
  AvailableProfessionals: {
    service: string;
    description: string;
    address: string;
    schedule: string;
    categoryId: number;
    categoryName: string;
    subcategoryId?: number;
  };
  OrderTracking: { orderId: string };
  OrderChat: { orderId: string };
  ProfessionalProfile: { professionalId: string };
  Notifications: undefined;
  EditField: {
    label: string;
    value: string;
    field: string;
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
  };
  MyAddresses: undefined;
  AddAddress: {
    addressId?: number;
    mapAddress?: {
      street: string;
      city: string;
      state: string;
      latitude: number;
      longitude: number;
      zipCode?: string;
    };
  };
};

export type TabParamList = {
  'Início': { address?: string };
  Pedidos: undefined;
  Perfil: undefined;
};
