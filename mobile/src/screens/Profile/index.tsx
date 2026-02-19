import { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  UserRound,
  MapPinned,
  CreditCard,
  BellDot,
  CircleHelp,
  Info,
  ChevronRight,
  Star,
  LogOut,
  Heart,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../@types/navigation';
import { colors } from '../../constants/colors';
import { useProfile } from '../../contexts/ProfileContext';
import { useAuth } from '../../contexts/AuthContext';

type ProfileNav = NativeStackNavigationProp<RootStackParamList>;

const menuItems = [
  { id: '1', label: 'Meus Enderecos', icon: MapPinned },
  { id: '2', label: 'Metodos de Pagamento', icon: CreditCard },
  { id: '4', label: 'Notificacoes', icon: BellDot },
  { id: '5', label: 'Ajuda e Suporte', icon: CircleHelp },
  { id: '6', label: 'Sobre o Pronto', icon: Info },
];

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileNav>();
  const { profile, loadingProfile, fetchProfile } = useProfile();
  const { signOut } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleMenuItem = (label: string) => {
    if (label === 'Notificacoes') {
      navigation.navigate('Notifications');
    } else if (label === 'Meus Enderecos') {
      navigation.navigate('MyAddresses');
    } else {
      Alert.alert(label, 'Em breve');
    }
  };

  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-bgDark px-5" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Titulo */}
        <Text className="text-white text-2xl font-bold py-4">Perfil</Text>

        {/* Card do usuario */}
        <TouchableOpacity
          className="flex-row items-center justify-between bg-surface rounded-2xl p-4 mb-6"
          activeOpacity={0.7}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <View className="flex-row items-center gap-3.5">
            <View className="w-14 h-14 rounded-full bg-bgDark items-center justify-center overflow-hidden">
              {profile?.profileImage ? (
                <Image source={{ uri: profile.profileImage }} className="w-full h-full" />
              ) : (
                <UserRound size={32} color={colors.textSecondary} />
              )}
            </View>
            <View className="gap-1">
              {loadingProfile ? (
                <ActivityIndicator size="small" color={colors.brand} />
              ) : (
                <>
                  <Text className="text-white text-lg font-bold">
                    {profile?.name || 'Usuario'}
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <Star size={14} color={colors.brand} fill={colors.brand} />
                    <Text className="text-brand text-sm font-semibold">
                      {profile?.rating?.toFixed(1) || '0.0'}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Servicos favoritos */}
        {profile?.favorites && profile.favorites.length > 0 && (
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white text-[17px] font-bold">Servicos favoritos</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text className="text-brand text-[13px] font-semibold">Ver todos</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2.5">
              {profile.favorites.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="bg-surface rounded-[14px] py-3.5 px-4 items-center gap-2 w-[100px]"
                  activeOpacity={0.7}
                >
                  <View className="w-11 h-11 rounded-xl bg-bgDark items-center justify-center">
                    <Text className="text-[22px]">{item.subcategory.icon}</Text>
                  </View>
                  <Text className="text-white text-[11px] font-semibold text-center">
                    {item.subcategory.name}
                  </Text>
                  <Heart size={12} color={colors.danger} fill={colors.danger} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Menu de opcoes */}
        <View className="bg-surface rounded-2xl overflow-hidden mb-7">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                className="flex-row items-center justify-between px-4 py-4 border-b border-white/5"
                activeOpacity={0.7}
                onPress={() => handleMenuItem(item.label)}
              >
                <View className="flex-row items-center gap-3.5">
                  <Icon size={20} color={colors.textSecondary} />
                  <Text className="text-white text-[15px] font-medium">{item.label}</Text>
                </View>
                <ChevronRight size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sair */}
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 py-4 mb-5"
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <LogOut size={18} color={colors.danger} />
          <Text className="text-danger text-base font-semibold">Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
