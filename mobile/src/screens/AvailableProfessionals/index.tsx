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
      // 1. Criar o pedido com categoryId e subcategoryId do backend
      const { data: order } = await api.post('/requests', {
        description,
        address,
        categoryId,
        subcategoryId,
        schedule: schedule === 'Agora' ? 'NOW' : 'SCHEDULED',
      });

      // 2. Atribuir o profissional
      await api.patch(`/requests/${order.id}/assign`, {
        professionalId: professional.id,
      });

      // 3. Navegar para o tracking
      navigation.navigate('OrderTracking', { orderId: String(order.id) });
    } catch (err: any) {
      Alert.alert('Erro', err.response?.data?.message || 'Não foi possível criar o pedido');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profissionais</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

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
        {professionals.length} profissionais encontrados
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {professionals.map((pro) => (
          <View key={pro.id} style={styles.card}>
            <TouchableOpacity
              style={styles.cardTop}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ProfessionalProfile', { professionalId: String(pro.id) })}
            >
              <View style={styles.avatar}>
                <UserRound size={28} color={colors.textSecondary} />
              </View>
              <View style={styles.proInfo}>
                <Text style={styles.proName}>{pro.name}</Text>
                <View style={styles.ratingRow}>
                  <Star size={14} color={colors.brand} fill={colors.brand} />
                  <Text style={styles.ratingText}>{pro.rating.toFixed(1)}</Text>
                  <Text style={styles.reviewsText}>({pro.reviewCount} avaliações)</Text>
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
                  <Text style={styles.metaText}>{pro.city || 'N/A'}</Text>
                </View>
                <Text style={styles.priceText}>
                  {pro.servicePrice
                    ? `R$ ${pro.servicePrice.toFixed(0)}/h`
                    : 'A combinar'}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.callBtn, creating && { opacity: 0.5 }]}
                activeOpacity={0.7}
                onPress={() => handleCall(pro)}
                disabled={creating}
              >
                <Text style={styles.callBtnText}>
                  {creating ? 'Criando pedido...' : 'Chamar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {professionals.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum profissional encontrado para esta categoria</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  orderInfo: { marginHorizontal: 20, backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 16 },
  orderService: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  orderMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderMetaText: { color: colors.textSecondary, fontSize: 13, flex: 0 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textSecondary },
  resultsLabel: { color: colors.textSecondary, fontSize: 13, paddingHorizontal: 20, marginBottom: 12 },
  list: { paddingHorizontal: 20, gap: 12 },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, gap: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.backgroundDark, alignItems: 'center', justifyContent: 'center' },
  proInfo: { flex: 1, gap: 4 },
  proName: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: colors.brand, fontSize: 14, fontWeight: '600' },
  reviewsText: { color: colors.textSecondary, fontSize: 12 },
  viewProfileRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  viewProfileText: { color: colors.brand, fontSize: 12, fontWeight: '600' },
  cardBottom: { gap: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: colors.textSecondary, fontSize: 13 },
  priceText: { color: colors.brand, fontSize: 16, fontWeight: '700' },
  callBtn: { backgroundColor: colors.brand, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  callBtnText: { color: colors.backgroundDark, fontSize: 15, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: colors.textSecondary, fontSize: 15, textAlign: 'center' },
});
