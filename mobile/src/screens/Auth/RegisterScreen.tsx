import { useState } from 'react';
import {
  View,
  Text,
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
    if (!email.trim()) e.email = 'Informe seu e-mail';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Informe um e-mail válido';
    if (!password) e.password = 'Crie uma senha';
    else if (password.length < 6) e.password = 'Mínimo 6 caracteres';
    else if (!/[A-Z]/.test(password)) e.password = 'Inclua uma letra maiúscula';
    else if (!/[a-z]/.test(password)) e.password = 'Inclua uma letra minúscula';
    else if (!/[0-9]/.test(password)) e.password = 'Inclua um número';
    if (!confirmPassword) e.confirmPassword = 'Confirme sua senha';
    else if (password !== confirmPassword) e.confirmPassword = 'As senhas não coincidem';
    if (!termsAccepted) e.terms = 'Você precisa aceitar os termos para continuar';
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

  const inputClass = (field: string) =>
    `bg-surface rounded-[14px] px-4 py-3.5 text-white text-base border-[1.5px] ${
      errors[field] ? 'border-danger' : 'border-transparent'
    }`;

  const inputRowClass = (field: string) =>
    `flex-row items-center bg-surface rounded-[14px] px-4 py-3.5 border-[1.5px] ${
      errors[field] ? 'border-danger' : 'border-transparent'
    }`;

  return (
    <SafeAreaView className="flex-1 bg-bgDark">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerClassName="px-6 pb-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center -ml-2 mt-2 mb-4"
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text className="text-white text-[28px] font-bold mb-2">
            Criar conta
          </Text>
          <Text className="text-textSecondary text-[15px] mb-8">
            Cadastre-se para usar o Pronto
          </Text>

          {/* Formulário */}
          <View className="gap-5 mb-8">
            {/* Nome */}
            <View>
              <Text className="text-textSecondary text-[13px] font-semibold mb-2">
                Nome completo
              </Text>
              <TextInput
                className={inputClass('name')}
                placeholder="Seu nome"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
                value={name}
                onChangeText={(t) => { setName(t); clearError('name'); }}
              />
              {!!errors.name && (
                <Text className="text-danger text-xs mt-1.5 ml-1">{errors.name}</Text>
              )}
            </View>

            {/* Email */}
            <View>
              <Text className="text-textSecondary text-[13px] font-semibold mb-2">
                E-mail
              </Text>
              <TextInput
                className={inputClass('email')}
                placeholder="seu@email.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => { setEmail(t); clearError('email'); }}
              />
              {!!errors.email && (
                <Text className="text-danger text-xs mt-1.5 ml-1">{errors.email}</Text>
              )}
            </View>

            {/* Senha */}
            <View>
              <Text className="text-textSecondary text-[13px] font-semibold mb-2">
                Senha
              </Text>
              <View className={inputRowClass('password')}>
                <TextInput
                  className="flex-1 text-white text-base"
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
              {!!errors.password && (
                <Text className="text-danger text-xs mt-1.5 ml-1">{errors.password}</Text>
              )}
              {password.length > 0 && (
                <View className="mt-2 gap-1">
                  <Text className={`text-xs ${password.length >= 6 ? 'text-brand' : 'text-textSecondary'}`}>
                    {password.length >= 6 ? '✓' : '○'} Mínimo 6 caracteres
                  </Text>
                  <Text className={`text-xs ${/[A-Z]/.test(password) ? 'text-brand' : 'text-textSecondary'}`}>
                    {/[A-Z]/.test(password) ? '✓' : '○'} Letra maiúscula
                  </Text>
                  <Text className={`text-xs ${/[a-z]/.test(password) ? 'text-brand' : 'text-textSecondary'}`}>
                    {/[a-z]/.test(password) ? '✓' : '○'} Letra minúscula
                  </Text>
                  <Text className={`text-xs ${/[0-9]/.test(password) ? 'text-brand' : 'text-textSecondary'}`}>
                    {/[0-9]/.test(password) ? '✓' : '○'} Número
                  </Text>
                </View>
              )}
            </View>

            {/* Confirmar Senha */}
            <View>
              <Text className="text-textSecondary text-[13px] font-semibold mb-2">
                Confirmar senha
              </Text>
              <View className={inputRowClass('confirmPassword')}>
                <TextInput
                  className="flex-1 text-white text-base"
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
                <Text className="text-danger text-xs mt-1.5 ml-1">{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Termos */}
            <View>
              <TouchableOpacity
                className="flex-row items-center gap-3"
                activeOpacity={0.7}
                onPress={() => { setTermsAccepted(!termsAccepted); clearError('terms'); }}
              >
                <View
                  className={`w-6 h-6 rounded-lg border-[1.5px] items-center justify-center ${
                    termsAccepted
                      ? 'bg-brand border-brand'
                      : 'border-textSecondary'
                  }`}
                >
                  {termsAccepted && <Check size={14} color="#121212" />}
                </View>
                <Text className="flex-1 text-textSecondary text-[13px] leading-[18px]">
                  Aceito os{' '}
                  <Text className="text-brand font-semibold">termos de uso</Text>
                  {' '}e{' '}
                  <Text className="text-brand font-semibold">política de privacidade</Text>
                </Text>
              </TouchableOpacity>
              {!!errors.terms && (
                <Text className="text-danger text-xs mt-1.5 ml-1">{errors.terms}</Text>
              )}
            </View>
          </View>

          {/* Botão Cadastrar */}
          <TouchableOpacity
            className={`bg-brand rounded-[14px] py-4 items-center mb-6 ${
              loading || !termsAccepted ? 'opacity-70' : ''
            }`}
            activeOpacity={0.8}
            onPress={handleRegister}
            disabled={loading || !termsAccepted}
          >
            {loading ? (
              <ActivityIndicator color="#121212" />
            ) : (
              <Text className="text-bgDark text-[17px] font-bold">Cadastrar</Text>
            )}
          </TouchableOpacity>

          {/* Link login */}
          <View className="flex-row justify-center">
            <Text className="text-textSecondary text-sm">Já tem conta? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text className="text-brand text-sm font-bold">Entrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
