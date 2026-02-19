import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../constants/colors';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView className="flex-1 bg-bgDark" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 py-3.5">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center"
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Política de Privacidade</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pt-2.5"
      >
        <Text className="text-white text-xl font-bold mb-4">
          Política de Privacidade — Pronto
        </Text>

        <Text className="text-textSecondary text-[15px] leading-[22px]">
          O Pronto coleta apenas as informações necessárias para conectar você a
          profissionais de forma rápida e segura.
        </Text>

        <Text className="text-white text-base font-bold mt-6 mb-2">Dados coletados</Text>
        <View className="gap-1.5 pl-2 mt-1">
          <Text className="text-textSecondary text-[15px] leading-[22px] pl-2 border-l-2 border-brand">
            Nome e contato
          </Text>
          <Text className="text-textSecondary text-[15px] leading-[22px] pl-2 border-l-2 border-brand">
            Localização e endereço
          </Text>
          <Text className="text-textSecondary text-[15px] leading-[22px] pl-2 border-l-2 border-brand">
            Histórico de pedidos
          </Text>
        </View>

        <Text className="text-white text-base font-bold mt-6 mb-2">Uso das informações</Text>
        <Text className="text-textSecondary text-[15px] leading-[22px]">Utilizamos seus dados para:</Text>
        <View className="gap-1.5 pl-2 mt-1">
          <Text className="text-textSecondary text-[15px] leading-[22px] pl-2 border-l-2 border-brand">
            Encontrar profissionais próximos
          </Text>
          <Text className="text-textSecondary text-[15px] leading-[22px] pl-2 border-l-2 border-brand">
            Acompanhar pedidos em tempo real
          </Text>
          <Text className="text-textSecondary text-[15px] leading-[22px] pl-2 border-l-2 border-brand">
            Oferecer suporte e melhorar o serviço
          </Text>
        </View>

        <Text className="text-white text-base font-bold mt-6 mb-2">Compartilhamento</Text>
        <Text className="text-textSecondary text-[15px] leading-[22px]">
          Compartilhamos apenas dados essenciais com o profissional escolhido
          para a realização do serviço.
        </Text>

        <Text className="text-white text-base font-bold mt-6 mb-2">Segurança</Text>
        <Text className="text-textSecondary text-[15px] leading-[22px]">
          Adotamos medidas para proteger suas informações e garantir uma
          experiência confiável.
        </Text>

        <Text className="text-brand text-sm font-semibold mt-8 text-center">
          Para dúvidas, entre em contato em: suporte@pronto.com
        </Text>

        <View className="h-[30px]" />
      </ScrollView>
    </SafeAreaView>
  );
}
