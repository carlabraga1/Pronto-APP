import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  BellOff,
  Package,
  MessageCircle,
  Tag,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';

type NotificationType = 'order' | 'chat' | 'promo';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
};

const typeConfig: Record<
  NotificationType,
  { icon: LucideIcon; color: string; bg: string; label: string }
> = {
  order: {
    icon: Package,
    color: colors.info,
    bg: 'rgba(59,130,246,0.15)',
    label: 'Pedido',
  },
  chat: {
    icon: MessageCircle,
    color: colors.brand,
    bg: 'rgba(255,193,7,0.15)',
    label: 'Mensagem',
  },
  promo: {
    icon: Tag,
    color: colors.success,
    bg: 'rgba(76,175,80,0.15)',
    label: 'Promoção',
  },
};

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Profissional a caminho',
    description: 'João Silva está a caminho para o serviço de Eletricista.',
    timestamp: 'Agora',
    read: false,
    orderId: '1',
  },
  {
    id: '2',
    type: 'chat',
    title: 'Nova mensagem de Pedro Santos',
    description: 'Vou precisar de acesso ao quadro de energia...',
    timestamp: '5 min',
    read: false,
    orderId: '2',
  },
  {
    id: '3',
    type: 'promo',
    title: '20% OFF em Limpeza Residencial',
    description: 'Aproveite o desconto exclusivo válido até sexta-feira!',
    timestamp: '30 min',
    read: false,
  },
  {
    id: '4',
    type: 'order',
    title: 'Pedido finalizado',
    description: 'O serviço de Cabeleireiro com Ana Costa foi concluído.',
    timestamp: '2h',
    read: true,
    orderId: '3',
  },
  {
    id: '5',
    type: 'chat',
    title: 'Mensagem de Ana Costa',
    description: 'Obrigada pela avaliação! Até a próxima.',
    timestamp: '3h',
    read: true,
    orderId: '3',
  },
  {
    id: '6',
    type: 'promo',
    title: 'Novidade: Serviços de Jardinagem',
    description: 'Agora você pode contratar jardineiros pelo Pronto!',
    timestamp: 'Ontem',
    read: true,
  },
  {
    id: '7',
    type: 'order',
    title: 'Pedido cancelado',
    description: 'O serviço de Encanador com Ricardo Lima foi cancelado.',
    timestamp: 'Ontem',
    read: true,
    orderId: '5',
  },
];

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();

  const renderItem = ({ item }: { item: Notification }) => {
    const config = typeConfig[item.type];
    const Icon = config.icon;

    return (
      <TouchableOpacity
        style={[styles.card, !item.read && styles.cardUnread]}
        activeOpacity={0.7}
      >
        {!item.read && <View style={styles.unreadDot} />}

        <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
          <Icon size={20} color={config.color} />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text
              style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={styles.cardTimestamp}>{item.timestamp}</Text>
          </View>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
            <Text style={[styles.typeBadgeText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <BellOff size={48} color={colors.textSecondary} />
      <Text style={styles.emptyText}>Nenhuma notificação</Text>
      <Text style={styles.emptySubtext}>
        Suas notificações aparecerão aqui
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={styles.backBtn} />
      </View>

      <FlatList
        data={mockNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          mockNotifications.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
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
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  cardUnread: {
    backgroundColor: 'rgba(255,193,7,0.04)',
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  cardTitleUnread: {
    fontWeight: '700',
  },
  cardTimestamp: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  cardDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 2,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
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
});
