import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../@types/navigation';
import { colors } from '../../constants/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const professional = {
  id: '1',
  name: 'João Silva',
  rating: 4.9,
  reviews: 127,
  specialty: 'Eletricista',
  city: 'São Paulo, SP',
  bio: 'Eletricista com mais de 10 anos de experiência em instalações residenciais e comerciais. Formado pelo SENAI, trabalho com dedicação e pontualidade.',
  memberSince: '2 anos',
  completedServices: 340,
  responseTime: '~5 min',
  verified: true,
};

const mockReviews = [
  {
    id: '1',
    author: 'Maria Souza',
    rating: 5,
    date: '2 semanas',
    comment: 'Excelente profissional! Resolveu o problema da tomada rapidamente.',
  },
  {
    id: '2',
    author: 'Pedro Lima',
    rating: 5,
    date: '1 mês',
    comment: 'Muito pontual e atencioso.',
  },
  {
    id: '3',
    author: 'Ana Clara',
    rating: 4,
    date: '1 mês',
    comment: 'Bom serviço, recomendo.',
  },
  {
    id: '4',
    author: 'Carlos Ferreira',
    rating: 5,
    date: '2 meses',
    comment: 'Profissional top! Já é o terceiro serviço que faço com ele.',
  },
];

export default function ProfessionalProfileScreen() {
  const navigation = useNavigation<NavigationProp>();

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <UserRound size={40} color={colors.textSecondary} />
          </View>
          <Text style={styles.profileName}>{professional.name}</Text>
          <View style={styles.ratingRow}>
            <Star size={16} color={colors.brand} fill={colors.brand} />
            <Text style={styles.ratingText}>{professional.rating}</Text>
            <Text style={styles.reviewsCount}>({professional.reviews} aval.)</Text>
          </View>
          <Text style={styles.specialty}>{professional.specialty}</Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color={colors.textSecondary} />
            <Text style={styles.locationText}>{professional.city}</Text>
          </View>
        </View>

        {/* Sobre */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SOBRE</Text>
          <View style={styles.card}>
            <Text style={styles.bioText}>{professional.bio}</Text>
          </View>
        </View>

        {/* Informações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMAÇÕES</Text>
          <View style={styles.card}>
            <View style={styles.infoItem}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>No app desde</Text>
              <Text style={styles.infoValue}>{professional.memberSince}</Text>
            </View>
            <View style={[styles.infoItem, styles.infoBorder]}>
              <Briefcase size={16} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Serviços</Text>
              <Text style={styles.infoValue}>{professional.completedServices}+</Text>
            </View>
            <View style={[styles.infoItem, styles.infoBorder]}>
              <Clock size={16} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Tempo resposta</Text>
              <Text style={styles.infoValue}>{professional.responseTime}</Text>
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AVALIAÇÕES ({professional.reviews})</Text>
          <View style={styles.reviewsList}>
            {mockReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.author}</Text>
                  <View style={styles.reviewMeta}>
                    <Star size={12} color={colors.brand} fill={colors.brand} />
                    <Text style={styles.reviewRating}>{review.rating}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>"{review.comment}"</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Spacer for fixed button */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Fixed CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.7}>
          <MessageSquare size={20} color={colors.backgroundDark} />
          <Text style={styles.ctaBtnText}>Chamar Profissional</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    paddingHorizontal: 20,
  },

  // Profile header
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  profileName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    color: colors.brand,
    fontSize: 16,
    fontWeight: '700',
  },
  reviewsCount: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  specialty: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
  },
  bioText: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },

  // Info items
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 10,
  },
  infoBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  infoLabel: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  verifiedText: {
    color: colors.success,
  },

  // Reviews
  reviewsList: {
    gap: 10,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewAuthor: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewRating: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: '600',
  },
  reviewDate: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  reviewComment: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // CTA
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    backgroundColor: colors.backgroundDark,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 16,
  },
  ctaBtnText: {
    color: colors.backgroundDark,
    fontSize: 16,
    fontWeight: '700',
  },
});
