export type RootStackParamList = {
  Tabs: { address?: string };
  Location: undefined;
  SubCategory: { categoryId: string };
  EditProfile: undefined;
  PrivacyPolicy: undefined;
  OrderDetail: { orderId: string };
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
