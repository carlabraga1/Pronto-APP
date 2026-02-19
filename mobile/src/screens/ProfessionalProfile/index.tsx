import { useState, useEffect } from 'react';
import {
  View,
  Text,
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
      <SafeAreaView className="flex-1 bg-bgDark" edges={['top']}>
        <View className="flex-row items-center justify-between px-5 py-3.5">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Profissional</Text>
          <View className="w-10 h-10" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

  if (!professional) {
    return (
      <SafeAreaView className="flex-1 bg-bgDark" edges={['top']}>
        <View className="flex-row items-center justify-between px-5 py-3.5">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Profissional</Text>
          <View className="w-10 h-10" />
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-textSecondary text-base">Profissional não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bgDark" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3.5">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center"
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Profissional</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5">
        {/* Profile header */}
        <View className="items-center py-5 gap-2">
          <View className="w-[90px] h-[90px] rounded-full bg-surface items-center justify-center mb-2">
            <UserRound size={40} color={colors.textSecondary} />
          </View>
          <Text className="text-white text-[22px] font-bold">{professional.name}</Text>
          <View className="flex-row items-center gap-1.5">
            <Star size={16} color={colors.brand} fill={colors.brand} />
            <Text className="text-brand text-base font-bold">{professional.rating.toFixed(1)}</Text>
            <Text className="text-textSecondary text-sm">({professional.reviewCount} aval.)</Text>
          </View>
          <Text className="text-white text-[15px] font-medium">{professional.category?.name || ''}</Text>
          {professional.city && (
            <View className="flex-row items-center gap-1">
              <MapPin size={14} color={colors.textSecondary} />
              <Text className="text-textSecondary text-sm">{professional.city}</Text>
            </View>
          )}
        </View>

        {/* Sobre */}
        {professional.bio && (
          <View className="mb-6">
            <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-3">SOBRE</Text>
            <View className="bg-surface rounded-[14px] p-4">
              <Text className="text-white text-sm leading-[22px]">{professional.bio}</Text>
            </View>
          </View>
        )}

        {/* Informações */}
        <View className="mb-6">
          <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-3">INFORMAÇÕES</Text>
          <View className="bg-surface rounded-[14px] p-4">
            <View className="flex-row items-center py-3 gap-2.5">
              <Calendar size={16} color={colors.textSecondary} />
              <Text className="flex-1 text-textSecondary text-sm">No app desde</Text>
              <Text className="text-white text-sm font-semibold">{formatMemberSince(professional.memberSince)}</Text>
            </View>
            <View className="flex-row items-center py-3 gap-2.5 border-t border-white/5">
              <Briefcase size={16} color={colors.textSecondary} />
              <Text className="flex-1 text-textSecondary text-sm">Serviços</Text>
              <Text className="text-white text-sm font-semibold">{professional.completedServices}+</Text>
            </View>
            <View className="flex-row items-center py-3 gap-2.5 border-t border-white/5">
              <Clock size={16} color={colors.textSecondary} />
              <Text className="flex-1 text-textSecondary text-sm">Tempo resposta</Text>
              <Text className="text-white text-sm font-semibold">
                {professional.responseTime ? `~${professional.responseTime} min` : 'N/A'}
              </Text>
            </View>
            <View className="flex-row items-center py-3 gap-2.5 border-t border-white/5">
              <ShieldCheck size={16} color={colors.textSecondary} />
              <Text className="flex-1 text-textSecondary text-sm">Verificado</Text>
              <Text className={`text-sm font-semibold ${professional.verified ? 'text-success' : 'text-white'}`}>
                {professional.verified ? 'Sim' : 'Não'}
              </Text>
            </View>
          </View>
        </View>

        {/* Avaliações */}
        {professional.reviews && professional.reviews.length > 0 && (
          <View className="mb-6">
            <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-3">
              AVALIAÇÕES ({professional.reviewCount})
            </Text>
            <View className="gap-2.5">
              {professional.reviews.map((review: any) => (
                <View key={review.id} className="bg-surface rounded-[14px] p-4 gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white text-sm font-semibold">{review.client?.name || 'Anônimo'}</Text>
                    <View className="flex-row items-center gap-1">
                      <Star size={12} color={colors.brand} fill={colors.brand} />
                      <Text className="text-brand text-[13px] font-semibold">{review.rating}</Text>
                      <Text className="text-textSecondary text-xs ml-1">{formatReviewDate(review.createdAt)}</Text>
                    </View>
                  </View>
                  {review.comment && (
                    <Text className="text-textSecondary text-sm leading-5 italic">"{review.comment}"</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>

      {/* Fixed CTA */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pt-3 pb-[30px] bg-bgDark border-t border-white/[0.06]">
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2.5 bg-brand rounded-[14px] py-4"
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <MessageSquare size={20} color={colors.backgroundDark} />
          <Text className="text-bgDark text-base font-bold">Chamar Profissional</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
