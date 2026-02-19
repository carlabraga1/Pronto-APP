import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView className="flex-1 bg-bgDark px-6">
      <View className="flex-1 justify-center items-center">
        <Text className="text-brand text-4xl font-extrabold tracking-wide mb-12">
          Pronto
        </Text>

        <Text className="text-white text-[28px] font-bold text-center leading-9 mb-3">
          Resolva qualquer serviço{'\n'}em minutos
        </Text>
        <Text className="text-textSecondary text-base text-center leading-[22px] px-5">
          Conecte-se a profissionais confiáveis perto de você
        </Text>
      </View>

      <View className="gap-3 pb-6">
        <TouchableOpacity
          className="bg-brand rounded-[14px] py-4 items-center"
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Login')}
        >
          <Text className="text-bgDark text-[17px] font-bold">Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="border-[1.5px] border-brand rounded-[14px] py-4 items-center"
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Register')}
        >
          <Text className="text-brand text-[17px] font-bold">Criar conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
