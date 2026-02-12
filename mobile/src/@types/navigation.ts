export type RootStackParamList = {
  Tabs: { address?: string };
  Location: undefined;
  SubCategory: { categoryId: string };
  EditProfile: undefined;
  PrivacyPolicy: undefined;
  OrderDetail: { orderId: string };
  CreateOrder: { service: string; categoryId: string };
  AvailableProfessionals: {
    service: string;
    description: string;
    address: string;
    schedule: string;
  };
  OrderTracking: { orderId: string };
  OrderChat: { orderId: string };
  ProfessionalProfile: { professionalId: string };
  EditField: {
    label: string;
    value: string;
    field: string;
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
  };
};

export type TabParamList = {
  'Início': { address?: string };
  Pedidos: undefined;
  Perfil: undefined;
};
