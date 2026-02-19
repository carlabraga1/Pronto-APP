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
  Phone,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  XCircle,
  Wrench,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../@types/navigation';
import { colors } from '../../constants/colors';
import { statusConfig } from './index';
import api from '../../services/api';

type OrderDetailRoute = RouteProp<RootStackParamList, 'OrderDetail'>;

export default function OrderDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<OrderDetailRoute>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/requests/${route.params.orderId}`);
      setOrder(data);
    } catch (err) {
      console.log('Erro ao buscar pedido:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bgDark" edges={['top']}>
        <View className="flex-row items-center justify-between px-5 py-3.5">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Detalhe do Pedido</Text>
          <View className="w-10 h-10" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-bgDark" edges={['top']}>
        <Text className="text-white text-base text-center mt-10">Pedido não encontrado</Text>
      </SafeAreaView>
    );
  }

  const status = statusConfig[order.status as keyof typeof statusConfig];
  const isActive = order.status !== 'FINALIZADO' && order.status !== 'CANCELADO';

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar pedido',
      'Tem certeza que deseja cancelar este pedido?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Cancelar pedido',
          style: 'destructive',
          onPress: async () => {
            setCanceling(true);
            try {
              await api.patch(`/requests/${order.id}/status`, { status: 'CANCELADO' });
              Alert.alert('Pedido cancelado', 'Seu pedido foi cancelado com sucesso.');
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Erro', err.response?.data?.message || 'Não foi possível cancelar');
            } finally {
              setCanceling(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bgDark" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3.5">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center"
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Detalhe do Pedido</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5">
        {/* Status */}
        <View className="bg-surface rounded-[14px] flex-row overflow-hidden mb-6">
          <View className="w-1" style={{ backgroundColor: status.color }} />
          <View className="flex-1 p-4 gap-3.5">
            <View
              className="self-start px-3 py-[5px] rounded-[10px]"
              style={{ backgroundColor: status.bg }}
            >
              <Text className="text-[13px] font-semibold" style={{ color: status.color }}>
                {status.label}
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="w-[46px] h-[46px] rounded-[14px] bg-bgDark items-center justify-center">
                <Wrench size={22} color={colors.brand} />
              </View>
              <View className="gap-0.5">
                <Text className="text-white text-[17px] font-bold">{order.category?.name || 'Serviço'}</Text>
                <Text className="text-textSecondary text-[13px]">Pedido #{order.id}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profissional */}
        {order.professional && (
          <View className="mb-5">
            <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-2.5">
              Profissional
            </Text>
            <View className="bg-surface rounded-[14px] p-4">
              <View className="flex-row items-center gap-3.5 mb-3.5">
                <View className="w-[50px] h-[50px] rounded-full bg-bgDark items-center justify-center">
                  <UserRound size={28} color={colors.textSecondary} />
                </View>
                <View className="gap-1">
                  <Text className="text-white text-base font-semibold">{order.professional.name}</Text>
                  <View className="flex-row items-center gap-1">
                    <Star size={14} color={colors.brand} fill={colors.brand} />
                    <Text className="text-brand text-sm font-semibold">
                      {order.professional.rating?.toFixed(1) || '0.0'}
                    </Text>
                  </View>
                </View>
              </View>
              {order.professional.phoneNumber && (
                <TouchableOpacity
                  className="flex-row items-center justify-center gap-2 border border-brand rounded-[10px] py-2.5"
                  activeOpacity={0.7}
                  onPress={() => Alert.alert('Ligar', order.professional.phoneNumber)}
                >
                  <Phone size={18} color={colors.brand} />
                  <Text className="text-brand text-sm font-semibold">Ligar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Informações do serviço */}
        <View className="mb-5">
          <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-2.5">
            Informações
          </Text>
          <View className="bg-surface rounded-[14px] p-4">
            <View className="flex-row items-center gap-3 py-3">
              <Calendar size={16} color={colors.textSecondary} />
              <View className="gap-0.5 flex-1">
                <Text className="text-textSecondary text-xs">Data</Text>
                <Text className="text-white text-sm font-medium">{formatDate(order.createdAt)}</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3 py-3 border-t border-white/5">
              <Clock size={16} color={colors.textSecondary} />
              <View className="gap-0.5 flex-1">
                <Text className="text-textSecondary text-xs">Horário</Text>
                <Text className="text-white text-sm font-medium">{formatTime(order.createdAt)}</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3 py-3 border-t border-white/5">
              <MapPin size={16} color={colors.textSecondary} />
              <View className="gap-0.5 flex-1">
                <Text className="text-textSecondary text-xs">Endereço</Text>
                <Text className="text-white text-sm font-medium">{order.address}</Text>
              </View>
            </View>

            {order.price && (
              <View className="flex-row items-center gap-3 py-3 border-t border-white/5">
                <DollarSign size={16} color={colors.textSecondary} />
                <View className="gap-0.5 flex-1">
                  <Text className="text-textSecondary text-xs">Valor</Text>
                  <Text className="text-brand text-base font-bold">
                    R$ {order.price.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Descrição */}
        {order.description && (
          <View className="mb-5">
            <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-2.5">
              Descrição
            </Text>
            <View className="bg-surface rounded-[14px] p-4">
              <Text className="text-white text-sm leading-[22px]">
                {order.description}
              </Text>
            </View>
          </View>
        )}

        {/* Ação */}
        {isActive && (
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 py-4 mt-1"
            activeOpacity={0.7}
            onPress={handleCancel}
            disabled={canceling}
          >
            <XCircle size={18} color={colors.danger} />
            <Text className="text-danger text-base font-semibold">
              {canceling ? 'Cancelando...' : 'Cancelar pedido'}
            </Text>
          </TouchableOpacity>
        )}

        <View className="h-[30px]" />
      </ScrollView>
    </SafeAreaView>
  );
}
