import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.title}>Meus Pedidos</Text>
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

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
      {displayOrders.length === 0 ? (
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
          {displayOrders.map((order) => {
            const status = statusConfig[order.status];
            const { date, time } = formatDate(order.createdAt);
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('OrderDetail', { orderId: String(order.id) })}
              >
                <View style={[styles.statusBar, { backgroundColor: status.color }]} />
                <View style={styles.cardContent}>
                  <View style={styles.cardTop}>
                    <View style={styles.serviceRow}>
                      <View style={styles.serviceIcon}>
                        <Wrench size={20} color={colors.brand} />
                      </View>
                      <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName}>
                          {order.category?.name || 'Serviço'}
                        </Text>
                        <Text style={styles.professionalName}>
                          {order.professional?.name || 'Aguardando profissional'}
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={18} color={colors.textSecondary} />
                  </View>

                  <View style={styles.cardBottom}>
                    <View style={styles.dateRow}>
                      <Clock size={14} color={colors.textSecondary} />
                      <Text style={styles.dateText}>
                        {date} às {time}
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
  list: {
    gap: 12,
  },
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
