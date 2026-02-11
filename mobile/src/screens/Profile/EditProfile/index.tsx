import { useState } from 'react';
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
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../constants/colors';

type PersonalField = {
  id: string;
  label: string;
  value: string;
  icon: typeof Phone;
};

export default function EditProfileScreen() {
  const navigation = useNavigation();

  const [name, setName] = useState('Carlos T.');
  const [phone, setPhone] = useState('+55 (11) 99999-9999');
  const [email, setEmail] = useState('carlos@email.com');
  const [address, setAddress] = useState('Rua das Flores, 123 - São Paulo');

  const personalFields: PersonalField[] = [
    { id: 'name', label: 'Nome completo', value: name, icon: UserRound },
    { id: 'phone', label: 'Telefone', value: phone, icon: Phone },
    { id: 'email', label: 'E-mail', value: email, icon: Mail },
  ];

  const handleChangePhoto = () => {
    Alert.alert('Alterar foto', 'Escolha uma opção', [
      { text: 'Câmera', onPress: () => {} },
      { text: 'Galeria', onPress: () => {} },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleEditField = (field: PersonalField) => {
    Alert.prompt
      ? Alert.prompt(`Editar ${field.label}`, '', (text) => {
          if (!text) return;
          if (field.id === 'name') setName(text);
          if (field.id === 'phone') setPhone(text);
          if (field.id === 'email') setEmail(text);
        }, 'plain-text', field.value)
      : Alert.alert(`Editar ${field.label}`, `Valor atual: ${field.value}`);
  };

  const handleChangePassword = () => {
    Alert.alert('Alterar Senha', 'Funcionalidade em desenvolvimento');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      'Tem certeza? Esta ação é irreversível e todos os seus dados serão apagados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive' },
      ],
    );
  };

  const handleSave = () => {
    Alert.alert('Sucesso', 'Alterações salvas com sucesso!');
    navigation.goBack();
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
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <UserRound size={48} color={colors.textSecondary} />
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
                      <Text style={styles.fieldValue}>{field.value}</Text>
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
              onPress={() => Alert.alert('Endereço', 'Editar endereço principal')}
            >
              <View style={styles.fieldLeft}>
                <MapPin size={18} color={colors.textSecondary} />
                <View style={styles.fieldText}>
                  <Text style={styles.fieldLabel}>Endereço principal</Text>
                  <Text style={styles.fieldValue}>{address}</Text>
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
              style={styles.fieldItem}
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
          </View>
        </View>

        {/* Privacidade */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidade</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={[styles.fieldItem, styles.fieldBorder]}
              activeOpacity={0.7}
              onPress={() => Alert.alert('Permissões', 'Gerenciar permissões de localização')}
            >
              <View style={styles.fieldLeft}>
                <Shield size={18} color={colors.textSecondary} />
                <Text style={styles.fieldLabel}>Permissões de localização</Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.fieldItem, styles.fieldBorder]}
              activeOpacity={0.7}
              onPress={() => Alert.alert('Privacidade', 'Abrir política de privacidade')}
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

        {/* Botão Salvar */}
        <TouchableOpacity
          style={styles.saveBtn}
          activeOpacity={0.8}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>Salvar Alterações</Text>
        </TouchableOpacity>

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

  // Header
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

  // Avatar
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

  // Sections
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

  // Fields
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

  // Save Button
  saveBtn: {
    backgroundColor: colors.brand,
    marginHorizontal: 20,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: colors.backgroundDark,
    fontSize: 16,
    fontWeight: '700',
  },
});
