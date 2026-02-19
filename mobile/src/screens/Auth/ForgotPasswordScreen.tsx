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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Mail, CircleCheck } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';


export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      setError('Informe seu e-mail ou telefone');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView className="flex-1 bg-bgDark">
        <View className="flex-1 justify-center items-center px-6 gap-4">
          <View className="mb-2">
            <CircleCheck size={48} color={colors.success} />
          </View>
          <Text className="text-white text-2xl font-bold text-center">
            Instruções enviadas!
          </Text>
          <Text className="text-textSecondary text-[15px] text-center leading-[22px] mb-4">
            Verifique seu e-mail ou telefone para recuperar sua senha.
          </Text>
          <TouchableOpacity
            className="bg-brand rounded-[14px] py-4 items-center w-full"
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Login')}
          >
            <Text className="text-bgDark text-[17px] font-bold">Voltar para login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
            Recuperar senha
          </Text>
          <Text className="text-textSecondary text-[15px] leading-[22px] mb-8">
            Digite seu e-mail ou telefone para receber um código de recuperação
          </Text>

          {/* Ícone decorativo */}
          <View className="items-center mb-8">
            <View className="w-[72px] h-[72px] rounded-[20px] bg-brand/10 items-center justify-center">
              <Mail size={32} color={colors.brand} />
            </View>
          </View>

          {/* Campo */}
          <View className="mb-8">
            <Text className="text-textSecondary text-[13px] font-semibold mb-2">
              E-mail ou Telefone
            </Text>
            <TextInput
              className={`bg-surface rounded-[14px] px-4 py-3.5 text-white text-base border-[1.5px] ${
                error ? 'border-danger' : 'border-transparent'
              }`}
              placeholder="seu@email.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (error) setError('');
              }}
            />
            {!!error && (
              <Text className="text-danger text-xs mt-1.5 ml-1">{error}</Text>
            )}
          </View>

          {/* Botão */}
          <TouchableOpacity
            className={`bg-brand rounded-[14px] py-4 items-center mb-4 ${
              loading ? 'opacity-70' : ''
            }`}
            activeOpacity={0.8}
            onPress={handleSend}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#121212" />
            ) : (
              <Text className="text-bgDark text-[17px] font-bold">Enviar código</Text>
            )}
          </TouchableOpacity>

          {/* Link voltar */}
          <TouchableOpacity
            className="items-center py-2"
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Login')}
          >
            <Text className="text-brand text-sm font-semibold">Voltar para login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
