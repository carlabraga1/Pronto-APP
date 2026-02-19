import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ClipboardList,
  ChevronRight,
  Clock,
  Wrench,
} from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../@types/navigation';
import { colors } from '../../constants/colors';
import api from '../../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type OrderStatus = 'PROCURANDO' | 'AGUARDANDO' | 'ACEITO' | 'A_CAMINHO' | 'INICIADO' | 'FINALIZADO' | 'CANCELADO';

export type Order = {
  id: number;
  description: string;
  status: OrderStatus;
  address: string;
  price: number | null;
  createdAt: string;
  category: { id: number; name: string } | null;
  subcategory: { id: number; name: string } | null;
  professional: { id: number; name: string; rating: number } | null;
};

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  PROCURANDO: { label: 'Procurando', color: colors.brand, bg: 'rgba(255,193,7,0.15)' },
  AGUARDANDO: { label: 'Aguardando', color: colors.brand, bg: 'rgba(255,193,7,0.15)' },
  ACEITO: { label: 'Aceito', color: colors.success, bg: 'rgba(76,175,80,0.15)' },
  A_CAMINHO: { label: 'A caminho', color: colors.info, bg: 'rgba(59,130,246,0.15)' },
  INICIADO: { label: 'Iniciado', color: colors.success, bg: 'rgba(76,175,80,0.15)' },
  FINALIZADO: { label: 'Finalizado', color: colors.success, bg: 'rgba(76,175,80,0.15)' },
  CANCELADO: { label: 'Cancelado', color: colors.danger, bg: 'rgba(239,68,68,0.15)' },
};

export { statusConfig };

type Tab = 'ativos' | 'historico';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return { date: `${day} ${month} ${year}`, time };
}

export default function OrdersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<Tab>('ativos');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const { data } = await api.get('/requests?me=1');
          if (active) setOrders(data);
        } catch (err) {
          console.log('Erro ao buscar pedidos:', err);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [])
  );

  const activeOrders = orders.filter(
    (o) => o.status !== 'FINALIZADO' && o.status !== 'CANCELADO',
  );
  const historyOrders = orders.filter(
    (o) => o.status === 'FINALIZADO' || o.status === 'CANCELADO',
  );

  const displayOrders = activeTab === 'ativos' ? activeOrders : historyOrders;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bgDark px-5" edges={['top']}>
        <Text className="text-white text-2xl font-bold py-4">Meus Pedidos</Text>
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bgDark px-5" edges={['top']}>
      <Text className="text-white text-2xl font-bold py-4">Meus Pedidos</Text>

      {/* Tabs */}
      <View className="flex-row bg-surface rounded-xl p-1 mb-5">
        <TouchableOpacity
          className={`flex-1 py-2.5 items-center rounded-[10px] ${
            activeTab === 'ativos' ? 'bg-brand' : ''
          }`}
          activeOpacity={0.7}
          onPress={() => setActiveTab('ativos')}
        >
          <Text
            className={`text-sm font-semibold ${
              activeTab === 'ativos' ? 'text-bgDark' : 'text-textSecondary'
            }`}
          >
            Ativos ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-2.5 items-center rounded-[10px] ${
            activeTab === 'historico' ? 'bg-brand' : ''
          }`}
          activeOpacity={0.7}
          onPress={() => setActiveTab('historico')}
        >
          <Text
            className={`text-sm font-semibold ${
              activeTab === 'historico' ? 'text-bgDark' : 'text-textSecondary'
            }`}
          >
            Histórico ({historyOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de pedidos */}
      {displayOrders.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ClipboardList size={48} color={colors.textSecondary} />
          <Text className="text-white text-lg font-semibold">
            {activeTab === 'ativos'
              ? 'Nenhum pedido ativo'
              : 'Nenhum pedido no histórico'}
          </Text>
          <Text className="text-textSecondary text-sm">
            {activeTab === 'ativos'
              ? 'Seus pedidos em andamento aparecerão aqui'
              : 'Seus pedidos finalizados aparecerão aqui'}
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-3"
        >
          {displayOrders.map((order) => {
            const status = statusConfig[order.status];
            const { date, time } = formatDate(order.createdAt);
            return (
              <TouchableOpacity
                key={order.id}
                className="bg-surface rounded-[14px] flex-row overflow-hidden"
                activeOpacity={0.7}
                onPress={() => navigation.navigate('OrderDetail', { orderId: String(order.id) })}
              >
                <View className="w-1" style={{ backgroundColor: status.color }} />
                <View className="flex-1 p-4 gap-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="w-[42px] h-[42px] rounded-xl bg-bgDark items-center justify-center">
                        <Wrench size={20} color={colors.brand} />
                      </View>
                      <View className="gap-0.5 flex-1">
                        <Text className="text-white text-[15px] font-semibold">
                          {order.category?.name || 'Serviço'}
                        </Text>
                        <Text className="text-textSecondary text-[13px]">
                          {order.professional?.name || 'Aguardando profissional'}
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={18} color={colors.textSecondary} />
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1.5">
                      <Clock size={14} color={colors.textSecondary} />
                      <Text className="text-textSecondary text-[13px]">
                        {date} às {time}
                      </Text>
                    </View>
                    <View
                      className="px-2.5 py-1 rounded-[10px]"
                      style={{ backgroundColor: status.bg }}
                    >
                      <Text className="text-xs font-semibold" style={{ color: status.color }}>
                        {status.label}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
          <View className="h-5" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
