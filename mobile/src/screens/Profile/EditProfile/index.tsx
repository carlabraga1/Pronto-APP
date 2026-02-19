import { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Camera,
  UserRound,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Lock,
  MapPinned,
  Shield,
  FileText,
  Trash2,
  Smartphone,
  Monitor,
  Clock,
  LogOut,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../../constants/colors';
import { RootStackParamList } from '../../../@types/navigation';
import { useProfile } from '../../../contexts/ProfileContext';
import { useAuth } from '../../../contexts/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type PersonalField = {
  id: string;
  label: string;
  value: string;
  icon: typeof Phone;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
};

export default function EditProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    profile,
    loginActivities,
    fetchProfile,
    updateProfile,
    changePassword,
    fetchLoginActivities,
    endAllSessions,
    deleteAccount,
  } = useProfile();
  const { signOut } = useAuth();

  useEffect(() => {
    fetchProfile();
    fetchLoginActivities();
  }, [fetchProfile, fetchLoginActivities]);

  const personalFields: PersonalField[] = [
    { id: 'name', label: 'Nome completo', value: profile?.name || '', icon: UserRound },
    { id: 'phoneNumber', label: 'Telefone', value: profile?.phoneNumber || '', icon: Phone, keyboardType: 'phone-pad' },
    { id: 'email', label: 'E-mail', value: profile?.email || '', icon: Mail, keyboardType: 'email-address' },
  ];

  const addressText = profile?.address
    ? `${profile.address.street}, ${profile.address.number} - ${profile.address.city}`
    : 'Nenhum endereço cadastrado';

  const pickImage = async (source: 'camera' | 'gallery') => {
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para tirar fotos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        try {
          await updateProfile({ profileImage: result.assets[0].uri });
        } catch {
          Alert.alert('Erro', 'Não foi possível atualizar a foto.');
        }
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para selecionar fotos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        try {
          await updateProfile({ profileImage: result.assets[0].uri });
        } catch {
          Alert.alert('Erro', 'Não foi possível atualizar a foto.');
        }
      }
    }
  };

  const handleChangePhoto = () => {
    const options: any[] = [
      { text: 'Câmera', onPress: () => pickImage('camera') },
      { text: 'Galeria', onPress: () => pickImage('gallery') },
    ];
    if (profile?.profileImage) {
      options.push({
        text: 'Remover foto',
        style: 'destructive' as const,
        onPress: async () => {
          try {
            await updateProfile({ profileImage: '' });
          } catch {
            Alert.alert('Erro', 'Não foi possível remover a foto.');
          }
        },
      });
    }
    options.push({ text: 'Cancelar', style: 'cancel' as const });
    Alert.alert('Alterar foto', 'Escolha uma opção', options);
  };

  const handleEditField = (field: PersonalField) => {
    navigation.navigate('EditField', {
      label: field.label,
      value: field.value,
      field: field.id,
      keyboardType: field.keyboardType,
    });
  };

  const handleChangePassword = () => {
    Alert.prompt(
      'Alterar Senha',
      'Digite sua senha atual:',
      (currentPwd) => {
        if (!currentPwd) return;
        Alert.prompt(
          'Nova Senha',
          'Digite a nova senha (mín. 6 caracteres):',
          async (newPwd) => {
            if (!newPwd || newPwd.length < 6) {
              Alert.alert('Erro', 'A nova senha deve ter no mínimo 6 caracteres.');
              return;
            }
            try {
              await changePassword(currentPwd, newPwd);
              Alert.alert('Sucesso', 'Senha alterada com sucesso!');
            } catch (err: any) {
              const msg = err?.response?.data?.message || 'Não foi possível alterar a senha.';
              Alert.alert('Erro', msg);
            }
          },
          'secure-text',
        );
      },
      'secure-text',
    );
  };

  const handleLogoutAll = () => {
    Alert.alert(
      'Encerrar todas as sessões',
      'Você será desconectado de todos os dispositivos, exceto este. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Encerrar todas',
          style: 'destructive',
          onPress: async () => {
            try {
              await endAllSessions();
              Alert.alert('Sucesso', 'Todas as outras sessões foram encerradas.');
            } catch {
              Alert.alert('Erro', 'Não foi possível encerrar as sessões.');
            }
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      'Tem certeza? Esta ação é irreversível e todos os seus dados serão apagados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              signOut();
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir a conta.');
            }
          },
        },
      ],
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 5) return 'Agora';
    if (diffMin < 60) return `${diffMin} min atrás`;

    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <Text style={styles.headerTitle}>Informações da conta</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              {profile?.profileImage ? (
                <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} />
              ) : (
                <UserRound size={48} color={colors.textSecondary} />
              )}
            </View>
            <TouchableOpacity
              style={styles.cameraBtn}
              activeOpacity={0.7}
              onPress={handleChangePhoto}
            >
              <Camera size={16} color={colors.backgroundDark} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={handleChangePhoto}>
            <Text style={styles.changePhotoText}>Alterar Foto</Text>
          </TouchableOpacity>
        </View>

        {/* Dados Pessoais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>
          <View style={styles.card}>
            {personalFields.map((field, index) => {
              const Icon = field.icon;
              return (
                <TouchableOpacity
                  key={field.id}
                  style={[
                    styles.fieldItem,
                    index < personalFields.length - 1 && styles.fieldBorder,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleEditField(field)}
                >
                  <View style={styles.fieldLeft}>
                    <Icon size={18} color={colors.textSecondary} />
                    <View style={styles.fieldText}>
                      <Text style={styles.fieldLabel}>{field.label}</Text>
                      <Text style={styles.fieldValue}>{field.value || 'Não informado'}</Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Endereços */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endereços</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.fieldItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('MyAddresses')}
            >
              <View style={styles.fieldLeft}>
                <MapPin size={18} color={colors.textSecondary} />
                <View style={styles.fieldText}>
                  <Text style={styles.fieldLabel}>Endereço principal</Text>
                  <Text style={styles.fieldValue}>{addressText}</Text>
                </View>
              </View>
              <MapPinned size={18} color={colors.brand} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Segurança */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Segurança</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={[styles.fieldItem, styles.fieldBorder]}
              activeOpacity={0.7}
              onPress={handleChangePassword}
            >
              <View style={styles.fieldLeft}>
                <Lock size={18} color={colors.textSecondary} />
                <View style={styles.fieldText}>
                  <Text style={styles.fieldLabel}>Alterar senha</Text>
                  <Text style={styles.fieldValue}>••••••••</Text>
                </View>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Atividades de Login */}
            <View style={styles.loginHeader}>
              <Clock size={16} color={colors.textSecondary} />
              <Text style={styles.loginHeaderText}>Atividades de login</Text>
            </View>

            {loginActivities.length === 0 ? (
              <View style={styles.loginItem}>
                <Text style={styles.fieldValue}>Nenhuma atividade registrada</Text>
              </View>
            ) : (
              loginActivities.map((activity, index) => (
                <View
                  key={activity.id}
                  style={[
                    styles.loginItem,
                    index < loginActivities.length - 1 && styles.fieldBorder,
                  ]}
                >
                  <View style={styles.loginIcon}>
                    <Smartphone size={18} color={activity.isActive ? colors.brand : colors.textSecondary} />
                  </View>
                  <View style={styles.loginInfo}>
                    <View style={styles.loginDeviceRow}>
                      <Text style={styles.fieldLabel}>{activity.device}</Text>
                      {activity.isActive && (
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>Ativo</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.fieldValue}>{activity.location || 'Local desconhecido'}</Text>
                    <Text style={styles.loginDate}>{formatDate(activity.loginTime)}</Text>
                  </View>
                </View>
              ))
            )}

            {/* Encerrar todas as sessões */}
            <TouchableOpacity
              style={styles.logoutAllBtn}
              activeOpacity={0.7}
              onPress={handleLogoutAll}
            >
              <LogOut size={16} color={colors.danger} />
              <Text style={styles.logoutAllText}>Encerrar todas as sessões</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacidade */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidade</Text>
          <View style={styles.card}>


            <TouchableOpacity
              style={[styles.fieldItem, styles.fieldBorder]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              <View style={styles.fieldLeft}>
                <FileText size={18} color={colors.textSecondary} />
                <Text style={styles.fieldLabel}>Política de privacidade</Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fieldItem}
              activeOpacity={0.7}
              onPress={handleDeleteAccount}
            >
              <View style={styles.fieldLeft}>
                <Trash2 size={18} color={colors.danger} />
                <Text style={[styles.fieldLabel, { color: colors.danger }]}>
                  Excluir conta
                </Text>
              </View>
              <ChevronRight size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.brand,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.backgroundDark,
  },
  changePhotoText: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
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
    overflow: 'hidden',
  },
  fieldItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  fieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  fieldText: {
    gap: 2,
    flex: 1,
  },
  fieldLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  fieldValue: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  loginHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  loginHeaderText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loginItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  loginIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginInfo: {
    flex: 1,
    gap: 2,
  },
  loginDeviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeBadge: {
    backgroundColor: 'rgba(76,175,80,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeBadgeText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '600',
  },
  loginDate: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  logoutAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  logoutAllText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
});
