import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
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
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../@types/navigation';
import { colors } from '../../constants/colors';
import { mockOrders } from './index';

type OrderDetailRoute = RouteProp<RootStackParamList, 'OrderDetail'>;

const statusConfig = {
  PROCURANDO: { label: 'Procurando profissional', color: colors.brand, bg: 'rgba(255,193,7,0.15)' },
  ACEITO: { label: 'Aceito', color: colors.success, bg: 'rgba(76,175,80,0.15)' },
  A_CAMINHO: { label: 'A caminho', color: colors.info, bg: 'rgba(59,130,246,0.15)' },
  INICIADO: { label: 'Iniciado', color: colors.success, bg: 'rgba(76,175,80,0.15)' },
  FINALIZADO: { label: 'Finalizado', color: colors.success, bg: 'rgba(76,175,80,0.15)' },
  CANCELADO: { label: 'Cancelado', color: colors.danger, bg: 'rgba(239,68,68,0.15)' },
} as const;

export default function OrderDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<OrderDetailRoute>();
  const order = mockOrders.find((o) => o.id === route.params.orderId);

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.errorText}>Pedido não encontrado</Text>
      </SafeAreaView>
    );
  }

  const Icon = order.icon;
  const status = statusConfig[order.status];
  const isActive = order.status !== 'FINALIZADO' && order.status !== 'CANCELADO';

  const handleCancel = () => {
    Alert.alert(
      'Cancelar pedido',
      'Tem certeza que deseja cancelar este pedido?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Cancelar pedido',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Pedido cancelado', 'Seu pedido foi cancelado com sucesso.');
            navigation.goBack();
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
                <Icon size={22} color={colors.brand} />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{order.service}</Text>
                <Text style={styles.serviceId}>Pedido #{order.id}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profissional */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profissional</Text>
          <View style={styles.card}>
            <View style={styles.professionalRow}>
              <View style={styles.avatar}>
                <UserRound size={28} color={colors.textSecondary} />
              </View>
              <View style={styles.professionalInfo}>
                <Text style={styles.professionalName}>{order.professional}</Text>
                <View style={styles.ratingRow}>
                  <Star size={14} color={colors.brand} fill={colors.brand} />
                  <Text style={styles.ratingText}>{order.rating}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.phoneBtn}
              activeOpacity={0.7}
              onPress={() => Alert.alert('Ligar', order.phone)}
            >
              <Phone size={18} color={colors.brand} />
              <Text style={styles.phoneBtnText}>Ligar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Informações do serviço */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          <View style={styles.card}>
            <View style={styles.infoItem}>
              <Calendar size={16} color={colors.textSecondary} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Data</Text>
                <Text style={styles.infoValue}>{order.date}</Text>
              </View>
            </View>

            <View style={[styles.infoItem, styles.infoBorder]}>
              <Clock size={16} color={colors.textSecondary} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Horário</Text>
                <Text style={styles.infoValue}>{order.time}</Text>
              </View>
            </View>

            <View style={[styles.infoItem, styles.infoBorder]}>
              <MapPin size={16} color={colors.textSecondary} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Endereço</Text>
                <Text style={styles.infoValue}>{order.address}</Text>
              </View>
            </View>

            <View style={[styles.infoItem, styles.infoBorder]}>
              <DollarSign size={16} color={colors.textSecondary} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Valor</Text>
                <Text style={styles.priceValue}>{order.price}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Ação */}
        {isActive && (
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.7}
            onPress={handleCancel}
          >
            <XCircle size={18} color={colors.danger} />
            <Text style={styles.cancelText}>Cancelar pedido</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  errorText: {
    color: colors.textPrimary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
  },

  // Status card
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 24,
  },
  statusBarVertical: {
    width: 4,
  },
  statusContent: {
    flex: 1,
    padding: 16,
    gap: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: {
    gap: 2,
  },
  serviceName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  serviceId: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
  },

  // Profissional
  professionalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  professionalInfo: {
    gap: 4,
  },
  professionalName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '600',
  },
  phoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: 10,
    paddingVertical: 10,
  },
  phoneBtnText: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '600',
  },

  // Info items
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  infoBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  infoText: {
    gap: 2,
    flex: 1,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  priceValue: {
    color: colors.brand,
    fontSize: 16,
    fontWeight: '700',
  },

  // Cancel
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 4,
  },
  cancelText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
});
