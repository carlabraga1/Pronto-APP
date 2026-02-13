import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const { signUp, loading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Informe seu nome';
    if (!email.trim()) e.email = 'Informe seu e-mail ou telefone';
    if (!password) e.password = 'Crie uma senha';
    else if (password.length < 6) e.password = 'Senha deve ter no mínimo 6 caracteres';
    if (!confirmPassword) e.confirmPassword = 'Confirme sua senha';
    else if (password !== confirmPassword) e.confirmPassword = 'As senhas não coincidem';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await signUp(name.trim(), email.trim(), password);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Não foi possível criar a conta. Tente novamente.';
      Alert.alert('Erro', msg);
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>
            Cadastre-se para usar o Pronto
          </Text>

          {/* Formulário */}
          <View style={styles.form}>
            {/* Nome */}
            <View>
              <Text style={styles.label}>Nome completo</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Seu nome"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
                value={name}
                onChangeText={(t) => { setName(t); clearError('name'); }}
              />
              {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Email */}
            <View>
              <Text style={styles.label}>E-mail ou Telefone</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="seu@email.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => { setEmail(t); clearError('email'); }}
              />
              {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Senha */}
            <View>
              <Text style={styles.label}>Senha</Text>
              <View style={[styles.inputRow, errors.password && styles.inputError]}>
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(t) => { setPassword(t); clearError('password'); }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
              {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirmar Senha */}
            <View>
              <Text style={styles.label}>Confirmar senha</Text>
              <View style={[styles.inputRow, errors.confirmPassword && styles.inputError]}>
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Repita sua senha"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={(t) => { setConfirmPassword(t); clearError('confirmPassword'); }}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm(!showConfirm)}
                  activeOpacity={0.7}
                >
                  {showConfirm ? (
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
              {!!errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Termos */}
            <TouchableOpacity
              style={styles.termsRow}
              activeOpacity={0.7}
              onPress={() => setTermsAccepted(!termsAccepted)}
            >
              <View
                style={[
                  styles.checkbox,
                  termsAccepted && styles.checkboxChecked,
                ]}
              >
                {termsAccepted && <Check size={14} color={colors.backgroundDark} />}
              </View>
              <Text style={styles.termsText}>
                Aceito os{' '}
                <Text style={styles.termsLink}>termos de uso</Text>
                {' '}e{' '}
                <Text style={styles.termsLink}>política de privacidade</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botão Cadastrar */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            activeOpacity={0.8}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.backgroundDark} />
            ) : (
              <Text style={styles.primaryBtnText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          {/* Link login */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem conta? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    marginBottom: 32,
  },
  form: {
    gap: 20,
    marginBottom: 32,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputFlex: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  termsText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.brand,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: colors.backgroundDark,
    fontSize: 17,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '700',
  },
});
