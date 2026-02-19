import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  UserRound,
  Star,
  MapPin,
  ChevronRight,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../@types/navigation';
import { colors } from '../../constants/colors';

import api from '../../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AvailableProfessionalsRoute = RouteProp<RootStackParamList, 'AvailableProfessionals'>;

type Professional = {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  servicePrice: number | null;
  city: string | null;
  category: { id: number; name: string } | null;
};

export default function AvailableProfessionalsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AvailableProfessionalsRoute>();
  const { service, description, address, schedule, categoryId, categoryName, subcategoryId } = route.params;

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      const { data } = await api.get('/professionals', {
        params: { category: categoryName },
      });
      setProfessionals(data);
    } catch (err) {
      console.log('Erro ao buscar profissionais:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (professional: Professional) => {
    const priceText = professional.servicePrice
      ? `R$ ${professional.servicePrice.toFixed(2).replace('.', ',')}/h`
      : 'a combinar';

    Alert.alert(
      'Chamar profissional',
      `Deseja chamar ${professional.name}? (${priceText})`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Chamar',
          onPress: () => createOrderAndAssign(professional),
        },
      ],
    );
  };

  const createOrderAndAssign = async (professional: Professional) => {
    setCreating(true);
    try {
      const { data: order } = await api.post('/requests', {
        description,
        address,
        categoryId,
        subcategoryId,
        schedule: schedule === 'Agora' ? 'NOW' : 'SCHEDULED',
      });

      await api.patch(`/requests/${order.id}/assign`, {
        professionalId: professional.id,
      });

      navigation.navigate('OrderTracking', { orderId: String(order.id) });
    } catch (err: any) {
      Alert.alert('Erro', err.response?.data?.message || 'Não foi possível criar o pedido');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bgDark" edges={['top']}>
        <View className="flex-row items-center justify-between px-5 py-3.5">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Profissionais</Text>
          <View className="w-10 h-10" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bgDark" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 py-3.5">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center"
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Profissionais</Text>
        <View className="w-10 h-10" />
      </View>

      {/* Info do pedido */}
      <View className="mx-5 bg-surface rounded-[14px] p-4 mb-4">
        <Text className="text-white text-base font-bold mb-1.5">{service}</Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-textSecondary text-[13px]">{schedule}</Text>
          <View className="w-1 h-1 rounded-full bg-textSecondary" />
          <Text className="text-textSecondary text-[13px]" numberOfLines={1}>{address}</Text>
        </View>
      </View>

      <Text className="text-textSecondary text-[13px] px-5 mb-3">
        {professionals.length} profissionais encontrados
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 gap-3">
        {professionals.map((pro) => (
          <View key={pro.id} className="bg-surface rounded-[14px] p-4 gap-3.5">
            <TouchableOpacity
              className="flex-row items-center gap-3.5"
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ProfessionalProfile', { professionalId: String(pro.id) })}
            >
              <View className="w-[52px] h-[52px] rounded-full bg-bgDark items-center justify-center">
                <UserRound size={28} color={colors.textSecondary} />
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-white text-base font-semibold">{pro.name}</Text>
                <View className="flex-row items-center gap-1">
                  <Star size={14} color={colors.brand} fill={colors.brand} />
                  <Text className="text-brand text-sm font-semibold">{pro.rating.toFixed(1)}</Text>
                  <Text className="text-textSecondary text-xs">({pro.reviewCount} avaliações)</Text>
                </View>
                <View className="flex-row items-center gap-0.5 mt-0.5">
                  <Text className="text-brand text-xs font-semibold">Ver perfil</Text>
                  <ChevronRight size={14} color={colors.brand} />
                </View>
              </View>
            </TouchableOpacity>

            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1.5">
                  <MapPin size={14} color={colors.textSecondary} />
                  <Text className="text-textSecondary text-[13px]">{pro.city || 'N/A'}</Text>
                </View>
                <Text className="text-brand text-base font-bold">
                  {pro.servicePrice
                    ? `R$ ${pro.servicePrice.toFixed(0)}/h`
                    : 'A combinar'}
                </Text>
              </View>

              <TouchableOpacity
                className={`bg-brand rounded-xl py-3 items-center ${creating ? 'opacity-50' : ''}`}
                activeOpacity={0.7}
                onPress={() => handleCall(pro)}
                disabled={creating}
              >
                <Text className="text-bgDark text-[15px] font-bold">
                  {creating ? 'Criando pedido...' : 'Chamar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {professionals.length === 0 && (
          <View className="items-center py-10">
            <Text className="text-textSecondary text-[15px] text-center">
              Nenhum profissional encontrado para esta categoria
            </Text>
          </View>
        )}

        <View className="h-5" />
      </ScrollView>
    </SafeAreaView>
  );
}
