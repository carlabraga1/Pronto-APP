import { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
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
  { id: '1', label: 'Meus Endereços', icon: MapPinned },
  { id: '2', label: 'Métodos de Pagamento', icon: CreditCard },
  { id: '4', label: 'Notificações', icon: BellDot },
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
    if (label === 'Notificações') {
      navigation.navigate('Notifications');
    } else if (label === 'Meus Endereços') {
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Título */}
        <Text style={styles.title}>Perfil</Text>

        {/* Card do usuário */}
        <TouchableOpacity
          style={styles.userCard}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              {profile?.profileImage ? (
                <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} />
              ) : (
                <UserRound size={32} color={colors.textSecondary} />
              )}
            </View>
            <View style={styles.userText}>
              {loadingProfile ? (
                <ActivityIndicator size="small" color={colors.brand} />
              ) : (
                <>
                  <Text style={styles.userName}>{profile?.name || 'Usuário'}</Text>
                  <View style={styles.ratingRow}>
                    <Star size={14} color={colors.brand} fill={colors.brand} />
                    <Text style={styles.ratingText}>{profile?.rating?.toFixed(1) || '0.0'}</Text>
                  </View>
                </>
              )}
            </View>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Serviços favoritos */}
        {profile?.favorites && profile.favorites.length > 0 && (
          <View style={styles.favSection}>
            <View style={styles.favHeader}>
              <Text style={styles.favTitle}>Serviços favoritos</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.favSeeAll}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favList}>
              {profile.favorites.map((item) => (
                <TouchableOpacity key={item.id} style={styles.favCard} activeOpacity={0.7}>
                  <View style={styles.favIcon}>
                    <Text style={styles.favIconText}>{item.subcategory.icon}</Text>
                  </View>
                  <Text style={styles.favName}>{item.subcategory.name}</Text>
                  <Heart size={12} color={colors.danger} fill={colors.danger} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Menu de opções */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => handleMenuItem(item.label)}
              >
                <View style={styles.menuLeft}>
                  <Icon size={20} color={colors.textSecondary} />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <ChevronRight size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sair */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7} onPress={handleLogout}>
          <LogOut size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
    paddingHorizontal: 20,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    paddingVertical: 16,
  },

  // Card do usuário
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userText: {
    gap: 4,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
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
  // Favoritos
  favSection: {
    marginBottom: 24,
  },
  favHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  favTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  favSeeAll: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: '600',
  },
  favList: {
    gap: 10,
  },
  favCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
    width: 100,
  },
  favIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favIconText: {
    fontSize: 22,
  },
  favName: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Menu
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 28,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginBottom: 20,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
});
