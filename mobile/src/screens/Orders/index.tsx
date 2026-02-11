import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ClipboardList,
  ChevronRight,
  Clock,
  Wrench,
  Zap,
  Scissors,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../@types/navigation';
import { colors } from '../../constants/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type OrderStatus = 'AGUARDANDO' | 'EM_ANDAMENTO' | 'FINALIZADO' | 'CANCELADO';

export type Order = {
  id: string;
  service: string;
  professional: string;
  date: string;
  time: string;
  status: OrderStatus;
  price: string;
  address: string;
  phone: string;
  rating: number;
  icon: typeof Wrench;
};

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  AGUARDANDO: { label: 'Aguardando', color: colors.brand, bg: 'rgba(255,193,7,0.15)' },
  EM_ANDAMENTO: { label: 'Em andamento', color: colors.success, bg: 'rgba(76,175,80,0.15)' },
  FINALIZADO: { label: 'Finalizado', color: colors.success, bg: 'rgba(76,175,80,0.15)' },
  CANCELADO: { label: 'Cancelado', color: colors.danger, bg: 'rgba(239,68,68,0.15)' },
};

export const mockOrders: Order[] = [
  {
    id: '1',
    service: 'Eletricista',
    professional: 'João Silva',
    date: '11 fev 2026',
    time: '14:00',
    status: 'AGUARDANDO',
    price: 'R$ 150,00',
    address: 'Rua das Flores, 123 - São Paulo',
    phone: '+55 (11) 98888-7777',
    rating: 4.8,
    icon: Zap,
  },
  {
    id: '2',
    service: 'Encanador',
    professional: 'Pedro Santos',
    date: '11 fev 2026',
    time: '10:00',
    status: 'EM_ANDAMENTO',
    price: 'R$ 200,00',
    address: 'Rua das Flores, 123 - São Paulo',
    phone: '+55 (11) 97777-6666',
    rating: 4.9,
    icon: Wrench,
  },
  {
    id: '3',
    service: 'Cabeleireiro',
    professional: 'Ana Costa',
    date: '09 fev 2026',
    time: '16:00',
    status: 'FINALIZADO',
    price: 'R$ 80,00',
    address: 'Av. Paulista, 1000 - São Paulo',
    phone: '+55 (11) 96666-5555',
    rating: 5.0,
    icon: Scissors,
  },
  {
    id: '4',
    service: 'Eletricista',
    professional: 'Carlos Mendes',
    date: '05 fev 2026',
    time: '09:00',
    status: 'FINALIZADO',
    price: 'R$ 120,00',
    address: 'Rua Augusta, 500 - São Paulo',
    phone: '+55 (11) 95555-4444',
    rating: 4.7,
    icon: Zap,
  },
  {
    id: '5',
    service: 'Encanador',
    professional: 'Ricardo Lima',
    date: '01 fev 2026',
    time: '11:00',
    status: 'CANCELADO',
    price: 'R$ 180,00',
    address: 'Rua Oscar Freire, 200 - São Paulo',
    phone: '+55 (11) 94444-3333',
    rating: 4.5,
    icon: Wrench,
  },
];

type Tab = 'ativos' | 'historico';

export default function OrdersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<Tab>('ativos');

  const activeOrders = mockOrders.filter(
    (o) => o.status !== 'FINALIZADO' && o.status !== 'CANCELADO',
  );
  const historyOrders = mockOrders.filter(
    (o) => o.status === 'FINALIZADO' || o.status === 'CANCELADO',
  );

  const orders = activeTab === 'ativos' ? activeOrders : historyOrders;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Meus Pedidos</Text>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ativos' && styles.tabActive]}
          activeOpacity={0.7}
          onPress={() => setActiveTab('ativos')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'ativos' && styles.tabTextActive,
            ]}
          >
            Ativos ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'historico' && styles.tabActive]}
          activeOpacity={0.7}
          onPress={() => setActiveTab('historico')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'historico' && styles.tabTextActive,
            ]}
          >
            Histórico ({historyOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de pedidos */}
      {orders.length === 0 ? (
        <View style={styles.empty}>
          <ClipboardList size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>
            {activeTab === 'ativos'
              ? 'Nenhum pedido ativo'
              : 'Nenhum pedido no histórico'}
          </Text>
          <Text style={styles.emptySubtext}>
            {activeTab === 'ativos'
              ? 'Seus pedidos em andamento aparecerão aqui'
              : 'Seus pedidos finalizados aparecerão aqui'}
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {orders.map((order) => {
            const Icon = order.icon;
            const status = statusConfig[order.status];
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
              >
                <View style={[styles.statusBar, { backgroundColor: status.color }]} />
                <View style={styles.cardContent}>
                  <View style={styles.cardTop}>
                    <View style={styles.serviceRow}>
                      <View style={styles.serviceIcon}>
                        <Icon size={20} color={colors.brand} />
                      </View>
                      <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName}>{order.service}</Text>
                        <Text style={styles.professionalName}>{order.professional}</Text>
                      </View>
                    </View>
                    <ChevronRight size={18} color={colors.textSecondary} />
                  </View>

                  <View style={styles.cardBottom}>
                    <View style={styles.dateRow}>
                      <Clock size={14} color={colors.textSecondary} />
                      <Text style={styles.dateText}>
                        {order.date} às {order.time}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.badgeText, { color: status.color }]}>
                        {status.label}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
    paddingHorizontal: 20,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    paddingVertical: 16,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.brand,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.backgroundDark,
  },

  // Empty
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  // List
  list: {
    gap: 12,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  statusBar: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  serviceIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: {
    gap: 2,
    flex: 1,
  },
  serviceName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  professionalName: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
