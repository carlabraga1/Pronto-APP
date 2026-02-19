import {
  View,
  Text,
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

const notifications: Notification[] = [];

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();


  const renderItem = ({ item }: { item: Notification }) => {
    const config = typeConfig[item.type];
    const Icon = config.icon;

    return (
      <TouchableOpacity
        className={`flex-row items-start bg-surface rounded-[14px] p-4 gap-3 ${
          !item.read ? 'bg-brand/[0.04]' : ''
        }`}
        activeOpacity={0.7}
      >
        {!item.read && (
          <View className="absolute top-4 left-2 w-2 h-2 rounded-full bg-brand" />
        )}

        <View
          className="w-[42px] h-[42px] rounded-xl items-center justify-center"
          style={{ backgroundColor: config.bg }}
        >
          <Icon size={20} color={config.color} />
        </View>

        <View className="flex-1 gap-1.5">
          <View className="flex-row justify-between items-center">
            <Text
              className={`text-white text-[15px] flex-1 mr-2 ${
                !item.read ? 'font-bold' : 'font-medium'
              }`}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text className="text-textSecondary text-xs">{item.timestamp}</Text>
          </View>
          <Text className="text-textSecondary text-[13px] leading-[18px]" numberOfLines={2}>
            {item.description}
          </Text>
          <View
            className="self-start px-2 py-[3px] rounded-lg mt-0.5"
            style={{ backgroundColor: config.bg }}
          >
            <Text className="text-[11px] font-semibold" style={{ color: config.color }}>
              {config.label}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center gap-3">
      <BellOff size={48} color={colors.textSecondary} />
      <Text className="text-white text-lg font-semibold">Nenhuma notificação</Text>
      <Text className="text-textSecondary text-sm">
        Suas notificações aparecerão aqui
      </Text>
    </View>
  );

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
        <Text className="text-white text-lg font-bold">Notificações</Text>
        <View className="w-10 h-10" />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerClassName={
          notifications.length === 0 ? 'flex-1' : 'px-5 pt-2 pb-5 gap-2.5'
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
