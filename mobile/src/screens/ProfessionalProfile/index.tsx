import { useState, useEffect } from 'react';
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
  ArrowLeft,
  UserRound,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Briefcase,
  Calendar,
  MessageSquare,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../@types/navigation';
import { colors } from '../../constants/colors';
import api from '../../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ProfessionalProfileRoute = RouteProp<RootStackParamList, 'ProfessionalProfile'>;

export default function ProfessionalProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProfessionalProfileRoute>();
  const { professionalId } = route.params;

  const [professional, setProfessional] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfessional();
  }, []);

  const fetchProfessional = async () => {
    try {
      const { data } = await api.get(`/professionals/${professionalId}`);
      setProfessional(data);
    } catch (err) {
      console.log('Erro ao buscar profissional:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatMemberSince = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
    if (diffMonths < 1) return 'Este mês';
    if (diffMonths < 12) return `${diffMonths} meses`;
    const years = Math.floor(diffMonths / 12);
    return `${years} ano${years > 1 ? 's' : ''}`;
  };

  const formatReviewDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 7) return `${diffDays} dias`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas`;
    return `${Math.floor(diffDays / 30)} meses`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profissional</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

  if (!professional) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profissional</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Profissional não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Profissional</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <UserRound size={40} color={colors.textSecondary} />
          </View>
          <Text style={styles.profileName}>{professional.name}</Text>
          <View style={styles.ratingRow}>
            <Star size={16} color={colors.brand} fill={colors.brand} />
            <Text style={styles.ratingText}>{professional.rating.toFixed(1)}</Text>
            <Text style={styles.reviewsCount}>({professional.reviewCount} aval.)</Text>
          </View>
          <Text style={styles.specialty}>{professional.category?.name || ''}</Text>
          {professional.city && (
            <View style={styles.locationRow}>
              <MapPin size={14} color={colors.textSecondary} />
              <Text style={styles.locationText}>{professional.city}</Text>
            </View>
          )}
        </View>

        {/* Sobre */}
        {professional.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SOBRE</Text>
            <View style={styles.card}>
              <Text style={styles.bioText}>{professional.bio}</Text>
            </View>
          </View>
        )}

        {/* Informações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMAÇÕES</Text>
          <View style={styles.card}>
            <View style={styles.infoItem}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>No app desde</Text>
              <Text style={styles.infoValue}>{formatMemberSince(professional.memberSince)}</Text>
            </View>
            <View style={[styles.infoItem, styles.infoBorder]}>
              <Briefcase size={16} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Serviços</Text>
              <Text style={styles.infoValue}>{professional.completedServices}+</Text>
            </View>
            <View style={[styles.infoItem, styles.infoBorder]}>
              <Clock size={16} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Tempo resposta</Text>
              <Text style={styles.infoValue}>
                {professional.responseTime ? `~${professional.responseTime} min` : 'N/A'}
              </Text>
            </View>
            <View style={[styles.infoItem, styles.infoBorder]}>
              <ShieldCheck size={16} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Verificado</Text>
              <Text style={[styles.infoValue, professional.verified && styles.verifiedText]}>
                {professional.verified ? 'Sim' : 'Não'}
              </Text>
            </View>
          </View>
        </View>

        {/* Avaliações */}
        {professional.reviews && professional.reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AVALIAÇÕES ({professional.reviewCount})</Text>
            <View style={styles.reviewsList}>
              {professional.reviews.map((review: any) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>{review.client?.name || 'Anônimo'}</Text>
                    <View style={styles.reviewMeta}>
                      <Star size={12} color={colors.brand} fill={colors.brand} />
                      <Text style={styles.reviewRating}>{review.rating}</Text>
                      <Text style={styles.reviewDate}>{formatReviewDate(review.createdAt)}</Text>
                    </View>
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment}>"{review.comment}"</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Fixed CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.ctaBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <MessageSquare size={20} color={colors.backgroundDark} />
          <Text style={styles.ctaBtnText}>Chamar Profissional</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  content: { paddingHorizontal: 20 },
  profileHeader: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  profileName: { color: colors.textPrimary, fontSize: 22, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { color: colors.brand, fontSize: 16, fontWeight: '700' },
  reviewsCount: { color: colors.textSecondary, fontSize: 14 },
  specialty: { color: colors.textPrimary, fontSize: 15, fontWeight: '500' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: colors.textSecondary, fontSize: 14 },
  section: { marginBottom: 24 },
  sectionTitle: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 16 },
  bioText: { color: colors.textPrimary, fontSize: 14, lineHeight: 22 },
  infoItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  infoBorder: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  infoLabel: { flex: 1, color: colors.textSecondary, fontSize: 14 },
  infoValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  verifiedText: { color: colors.success },
  reviewsList: { gap: 10 },
  reviewCard: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, gap: 8 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewAuthor: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  reviewMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewRating: { color: colors.brand, fontSize: 13, fontWeight: '600' },
  reviewDate: { color: colors.textSecondary, fontSize: 12, marginLeft: 4 },
  reviewComment: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
  ctaContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 30, backgroundColor: colors.backgroundDark, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.brand, borderRadius: 14, paddingVertical: 16 },
  ctaBtnText: { color: colors.backgroundDark, fontSize: 16, fontWeight: '700' },
});
