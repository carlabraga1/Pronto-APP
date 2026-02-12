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
  MapPin,
  ChevronRight,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../@types/navigation';
import { colors } from '../../constants/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AvailableProfessionalsRoute = RouteProp<RootStackParamList, 'AvailableProfessionals'>;

type Professional = {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  price: string;
  distance: string;
};

const mockProfessionals: Professional[] = [
  { id: '1', name: 'João Silva', rating: 4.9, reviews: 127, price: 'a partir de R$ 80', distance: '1.2 km' },
  { id: '2', name: 'Pedro Santos', rating: 4.8, reviews: 95, price: 'a partir de R$ 100', distance: '2.5 km' },
  { id: '3', name: 'Ana Costa', rating: 4.7, reviews: 203, price: 'a partir de R$ 90', distance: '3.1 km' },
  { id: '4', name: 'Carlos Mendes', rating: 4.6, reviews: 68, price: 'a partir de R$ 70', distance: '4.0 km' },
  { id: '5', name: 'Maria Oliveira', rating: 4.5, reviews: 152, price: 'a partir de R$ 110', distance: '5.3 km' },
];

export default function AvailableProfessionalsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AvailableProfessionalsRoute>();
  const { service, description, address, schedule } = route.params;

  const handleCall = (professional: Professional) => {
    Alert.alert(
      'Chamar profissional',
      `Deseja chamar ${professional.name}? (${professional.price}/h)`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Chamar',
          onPress: () => {
            navigation.navigate('OrderTracking', { orderId: `new-${professional.id}` });
          },
        },
      ],
    );
  };

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
        <Text style={styles.headerTitle}>Profissionais</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Info do pedido */}
      <View style={styles.orderInfo}>
        <Text style={styles.orderService}>{service}</Text>
        <View style={styles.orderMeta}>
          <Text style={styles.orderMetaText}>{schedule}</Text>
          <View style={styles.dot} />
          <Text style={styles.orderMetaText} numberOfLines={1}>{address}</Text>
        </View>
      </View>

      <Text style={styles.resultsLabel}>
        {mockProfessionals.length} profissionais encontrados
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {mockProfessionals.map((pro) => (
          <View key={pro.id} style={styles.card}>
            <TouchableOpacity
              style={styles.cardTop}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ProfessionalProfile', { professionalId: pro.id })}
            >
              <View style={styles.avatar}>
                <UserRound size={28} color={colors.textSecondary} />
              </View>
              <View style={styles.proInfo}>
                <Text style={styles.proName}>{pro.name}</Text>
                <View style={styles.ratingRow}>
                  <Star size={14} color={colors.brand} fill={colors.brand} />
                  <Text style={styles.ratingText}>{pro.rating}</Text>
                  <Text style={styles.reviewsText}>({pro.reviews} avaliações)</Text>
                </View>
                <View style={styles.viewProfileRow}>
                  <Text style={styles.viewProfileText}>Ver perfil</Text>
                  <ChevronRight size={14} color={colors.brand} />
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.cardBottom}>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MapPin size={14} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{pro.distance}</Text>
                </View>
                <Text style={styles.priceText}>{pro.price}</Text>
              </View>

              <TouchableOpacity
                style={styles.callBtn}
                activeOpacity={0.7}
                onPress={() => handleCall(pro)}
              >
                <Text style={styles.callBtnText}>Chamar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
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

  // Order info
  orderInfo: {
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  orderService: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderMetaText: {
    color: colors.textSecondary,
    fontSize: 13,
    flex: 0,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textSecondary,
  },

  resultsLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  // List
  list: {
    paddingHorizontal: 20,
    gap: 12,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proInfo: {
    flex: 1,
    gap: 4,
  },
  proName: {
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
  reviewsText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  viewProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  viewProfileText: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: '600',
  },
  cardBottom: {
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  priceText: {
    color: colors.brand,
    fontSize: 16,
    fontWeight: '700',
  },
  callBtn: {
    backgroundColor: colors.brand,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  callBtnText: {
    color: colors.backgroundDark,
    fontSize: 15,
    fontWeight: '700',
  },
});
