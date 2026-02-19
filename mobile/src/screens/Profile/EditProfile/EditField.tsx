import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../../../constants/colors';
import { RootStackParamList } from '../../../@types/navigation';
import { useProfile } from '../../../contexts/ProfileContext';

type EditFieldRouteProp = RouteProp<RootStackParamList, 'EditField'>;

export default function EditFieldScreen() {
  const navigation = useNavigation();
  const route = useRoute<EditFieldRouteProp>();
  const { label, value, field, keyboardType = 'default' } = route.params;
  const { updateProfile } = useProfile();
  const [text, setText] = useState(value);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await updateProfile({ [field]: text.trim() });
      Alert.alert('Sucesso', `${label} atualizado com sucesso!`);
      navigation.goBack();
    } catch (err: any) {
      const msg = err?.response?.data?.message || `Não foi possível atualizar ${label.toLowerCase()}.`;
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

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
        <Text className="text-white text-lg font-bold">{label}</Text>
        <View className="w-10 h-10" />
      </View>

      <View className="px-5 pt-5">
        <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-2.5">
          {label}
        </Text>
        <TextInput
          className="bg-surface rounded-[14px] px-4 py-4 text-white text-base border border-white/10"
          value={text}
          onChangeText={setText}
          keyboardType={keyboardType}
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.brand}
          autoFocus
        />

        <TouchableOpacity
          className={`bg-brand rounded-[14px] py-4 items-center mt-6 ${
            !text.trim() || loading ? 'opacity-50' : ''
          }`}
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={!text.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.backgroundDark} />
          ) : (
            <Text className="text-bgDark text-base font-bold">Salvar</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
