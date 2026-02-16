import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhe do Pedido</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.errorText}>Pedido não encontrado</Text>
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhe do Pedido</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Status */}
        <View style={styles.statusCard}>
          <View style={[styles.statusBarVertical, { backgroundColor: status.color }]} />
          <View style={styles.statusContent}>
            <View style={[styles.badge, { backgroundColor: status.bg }]}>
              <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
            </View>
            <View style={styles.serviceRow}>
              <View style={styles.serviceIcon}>
                <Wrench size={22} color={colors.brand} />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{order.category?.name || 'Serviço'}</Text>
                <Text style={styles.serviceId}>Pedido #{order.id}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profissional */}
        {order.professional && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profissional</Text>
            <View style={styles.card}>
              <View style={styles.professionalRow}>
                <View style={styles.avatar}>
                  <UserRound size={28} color={colors.textSecondary} />
                </View>
                <View style={styles.professionalInfo}>
                  <Text style={styles.professionalName}>{order.professional.name}</Text>
                  <View style={styles.ratingRow}>
                    <Star size={14} color={colors.brand} fill={colors.brand} />
                    <Text style={styles.ratingText}>{order.professional.rating?.toFixed(1) || '0.0'}</Text>
                  </View>
                </View>
              </View>
              {order.professional.phoneNumber && (
                <TouchableOpacity
                  style={styles.phoneBtn}
                  activeOpacity={0.7}
                  onPress={() => Alert.alert('Ligar', order.professional.phoneNumber)}
                >
                  <Phone size={18} color={colors.brand} />
                  <Text style={styles.phoneBtnText}>Ligar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Informações do serviço */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          <View style={styles.card}>
            <View style={styles.infoItem}>
              <Calendar size={16} color={colors.textSecondary} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Data</Text>
                <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
              </View>
            </View>

            <View style={[styles.infoItem, styles.infoBorder]}>
              <Clock size={16} color={colors.textSecondary} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Horário</Text>
                <Text style={styles.infoValue}>{formatTime(order.createdAt)}</Text>
              </View>
            </View>

            <View style={[styles.infoItem, styles.infoBorder]}>
              <MapPin size={16} color={colors.textSecondary} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Endereço</Text>
                <Text style={styles.infoValue}>{order.address}</Text>
              </View>
            </View>

            {order.price && (
              <View style={[styles.infoItem, styles.infoBorder]}>
                <DollarSign size={16} color={colors.textSecondary} />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Valor</Text>
                  <Text style={styles.priceValue}>R$ {order.price.toFixed(2).replace('.', ',')}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Descrição */}
        {order.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <View style={styles.card}>
              <Text style={{ color: colors.textPrimary, fontSize: 14, lineHeight: 22 }}>
                {order.description}
              </Text>
            </View>
          </View>
        )}

        {/* Ação */}
        {isActive && (
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.7}
            onPress={handleCancel}
            disabled={canceling}
          >
            <XCircle size={18} color={colors.danger} />
            <Text style={styles.cancelText}>
              {canceling ? 'Cancelando...' : 'Cancelar pedido'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundDark },
  errorText: { color: colors.textPrimary, fontSize: 16, textAlign: 'center', marginTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  content: { paddingHorizontal: 20 },
  statusCard: { backgroundColor: colors.surface, borderRadius: 14, flexDirection: 'row', overflow: 'hidden', marginBottom: 24 },
  statusBarVertical: { width: 4 },
  statusContent: { flex: 1, padding: 16, gap: 14 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  serviceIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.backgroundDark, alignItems: 'center', justifyContent: 'center' },
  serviceInfo: { gap: 2 },
  serviceName: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  serviceId: { color: colors.textSecondary, fontSize: 13 },
  section: { marginBottom: 20 },
  sectionTitle: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 16 },
  professionalRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.backgroundDark, alignItems: 'center', justifyContent: 'center' },
  professionalInfo: { gap: 4 },
  professionalName: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: colors.brand, fontSize: 14, fontWeight: '600' },
  phoneBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: colors.brand, borderRadius: 10, paddingVertical: 10 },
  phoneBtnText: { color: colors.brand, fontSize: 14, fontWeight: '600' },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  infoBorder: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  infoText: { gap: 2, flex: 1 },
  infoLabel: { color: colors.textSecondary, fontSize: 12 },
  infoValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '500' },
  priceValue: { color: colors.brand, fontSize: 16, fontWeight: '700' },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, marginTop: 4 },
  cancelText: { color: colors.danger, fontSize: 16, fontWeight: '600' },
});
