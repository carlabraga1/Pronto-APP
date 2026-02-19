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
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';


export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { signIn, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Informe seu e-mail';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = 'Informe um e-mail válido';
    if (!password) newErrors.password = 'Informe sua senha';
    else if (password.length < 6) newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await signIn(email.trim(), password);
    } catch (err: any) {
      const detail = err?.response?.data
        ? JSON.stringify(err.response.data)
        : err?.message || 'Erro desconhecido';
      Alert.alert('Erro no login', detail);
    }
  };

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
            Entrar
          </Text>
          <Text className="text-textSecondary text-[15px] mb-8">
            Bem-vindo de volta ao Pronto
          </Text>

          {/* Formulário */}
          <View className="gap-5 mb-8">
            <View>
              <Text className="text-textSecondary text-[13px] font-semibold mb-2">
                E-mail
              </Text>
              <TextInput
                className={`bg-surface rounded-[14px] px-4 py-3.5 text-white text-base border-[1.5px] ${
                  errors.email ? 'border-danger' : 'border-transparent'
                }`}
                placeholder="seu@email.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
                }}
              />
              {errors.email && (
                <Text className="text-danger text-xs mt-1.5 ml-1">{errors.email}</Text>
              )}
            </View>

            <View>
              <Text className="text-textSecondary text-[13px] font-semibold mb-2">
                Senha
              </Text>
              <View
                className={`flex-row items-center bg-surface rounded-[14px] px-4 py-3.5 border-[1.5px] ${
                  errors.password ? 'border-danger' : 'border-transparent'
                }`}
              >
                <TextInput
                  className="flex-1 text-white text-base"
                  placeholder="Sua senha"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                  }}
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
              {errors.password && (
                <Text className="text-danger text-xs mt-1.5 ml-1">{errors.password}</Text>
              )}
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              activeOpacity={0.7}
            >
              <Text className="text-brand text-sm font-semibold self-end">
                Esqueci minha senha
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botão Entrar */}
          <TouchableOpacity
            className={`bg-brand rounded-[14px] py-4 items-center mb-6 ${
              loading ? 'opacity-70' : ''
            }`}
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#121212" />
            ) : (
              <Text className="text-bgDark text-[17px] font-bold">Entrar</Text>
            )}
          </TouchableOpacity>

          {/* Link cadastrar */}
          <View className="flex-row justify-center">
            <Text className="text-textSecondary text-sm">Não tem conta? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text className="text-brand text-sm font-bold">Cadastrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
