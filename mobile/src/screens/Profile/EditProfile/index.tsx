import { useEffect } from 'react';
import {
  View,
  Text,
  Image,
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
  FileText,
  Trash2,
  Smartphone,
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
        <Text className="text-white text-lg font-bold">Informações da conta</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View className="items-center py-5 gap-3">
          <View className="relative">
            <View className="w-[100px] h-[100px] rounded-full bg-surface items-center justify-center border-[3px] border-brand overflow-hidden">
              {profile?.profileImage ? (
                <Image source={{ uri: profile.profileImage }} className="w-full h-full" />
              ) : (
                <UserRound size={48} color={colors.textSecondary} />
              )}
            </View>
            <TouchableOpacity
              className="absolute bottom-0 right-0 w-[34px] h-[34px] rounded-full bg-brand items-center justify-center border-[3px] border-bgDark"
              activeOpacity={0.7}
              onPress={handleChangePhoto}
            >
              <Camera size={16} color="#121212" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={handleChangePhoto}>
            <Text className="text-brand text-sm font-semibold">Alterar Foto</Text>
          </TouchableOpacity>
        </View>

        {/* Dados Pessoais */}
        <View className="px-5 mb-5">
          <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-2.5">
            Dados Pessoais
          </Text>
          <View className="bg-surface rounded-[14px] overflow-hidden">
            {personalFields.map((field, index) => {
              const Icon = field.icon;
              return (
                <TouchableOpacity
                  key={field.id}
                  className={`flex-row items-center justify-between px-4 py-3.5 ${
                    index < personalFields.length - 1 ? 'border-b border-white/5' : ''
                  }`}
                  activeOpacity={0.7}
                  onPress={() => handleEditField(field)}
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <Icon size={18} color={colors.textSecondary} />
                    <View className="gap-0.5 flex-1">
                      <Text className="text-white text-sm font-medium">{field.label}</Text>
                      <Text className="text-textSecondary text-[13px]">
                        {field.value || 'Não informado'}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Endereços */}
        <View className="px-5 mb-5">
          <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-2.5">
            Endereços
          </Text>
          <View className="bg-surface rounded-[14px] overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-3.5"
              activeOpacity={0.7}
              onPress={() => navigation.navigate('MyAddresses')}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <MapPin size={18} color={colors.textSecondary} />
                <View className="gap-0.5 flex-1">
                  <Text className="text-white text-sm font-medium">Endereço principal</Text>
                  <Text className="text-textSecondary text-[13px]">{addressText}</Text>
                </View>
              </View>
              <MapPinned size={18} color={colors.brand} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Segurança */}
        <View className="px-5 mb-5">
          <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-2.5">
            Segurança
          </Text>
          <View className="bg-surface rounded-[14px] overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-3.5 border-b border-white/5"
              activeOpacity={0.7}
              onPress={handleChangePassword}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <Lock size={18} color={colors.textSecondary} />
                <View className="gap-0.5 flex-1">
                  <Text className="text-white text-sm font-medium">Alterar senha</Text>
                  <Text className="text-textSecondary text-[13px]">••••••••</Text>
                </View>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Atividades de Login */}
            <View className="flex-row items-center gap-2 px-4 pt-3.5 pb-2.5 border-t border-white/5">
              <Clock size={16} color={colors.textSecondary} />
              <Text className="text-textSecondary text-xs font-semibold uppercase tracking-wide">
                Atividades de login
              </Text>
            </View>

            {loginActivities.length === 0 ? (
              <View className="flex-row items-start px-4 py-3 gap-3">
                <Text className="text-textSecondary text-[13px]">Nenhuma atividade registrada</Text>
              </View>
            ) : (
              loginActivities.map((activity, index) => (
                <View
                  key={activity.id}
                  className={`flex-row items-start px-4 py-3 gap-3 ${
                    index < loginActivities.length - 1 ? 'border-b border-white/5' : ''
                  }`}
                >
                  <View className="w-9 h-9 rounded-[10px] bg-white/5 items-center justify-center">
                    <Smartphone size={18} color={activity.isActive ? colors.brand : colors.textSecondary} />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-white text-sm font-medium">{activity.device}</Text>
                      {activity.isActive && (
                        <View className="bg-success/15 px-2 py-0.5 rounded-[10px]">
                          <Text className="text-success text-[11px] font-semibold">Ativo</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-textSecondary text-[13px]">
                      {activity.location || 'Local desconhecido'}
                    </Text>
                    <Text className="text-textSecondary text-xs mt-0.5">
                      {formatDate(activity.loginTime)}
                    </Text>
                  </View>
                </View>
              ))
            )}

            {/* Encerrar todas as sessões */}
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 py-3.5 border-t border-white/5"
              activeOpacity={0.7}
              onPress={handleLogoutAll}
            >
              <LogOut size={16} color={colors.danger} />
              <Text className="text-danger text-sm font-semibold">Encerrar todas as sessões</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacidade */}
        <View className="px-5 mb-5">
          <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-2.5">
            Privacidade
          </Text>
          <View className="bg-surface rounded-[14px] overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-3.5 border-b border-white/5"
              activeOpacity={0.7}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <FileText size={18} color={colors.textSecondary} />
                <Text className="text-white text-sm font-medium">Política de privacidade</Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-3.5"
              activeOpacity={0.7}
              onPress={handleDeleteAccount}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <Trash2 size={18} color={colors.danger} />
                <Text className="text-danger text-sm font-medium">Excluir conta</Text>
              </View>
              <ChevronRight size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-[30px]" />
      </ScrollView>
    </SafeAreaView>
  );
}
