import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MapPin,
  Clock,
  CalendarDays,
  ChevronRight,
  Search,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../@types/navigation';
import { colors } from '../../constants/colors';
import { getIcon } from '../../constants/iconMap';
import { getCurrentLocation } from '../../services/location';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CreateOrderRoute = RouteProp<RootStackParamList, 'CreateOrder'>;

type Schedule = 'now' | 'scheduled';

const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

export default function CreateOrderScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CreateOrderRoute>();
  const { service, categoryId, categoryName, categoryIcon, subcategoryId } = route.params;

  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [schedule, setSchedule] = useState<Schedule>('now');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    (async () => {
      const result = await getCurrentLocation();
      setAddress(result.address);
      setLoadingAddress(false);
    })();
  }, []);

  const canProceed = description.trim().length > 0;

  const handleProceed = () => {
    const scheduleText = schedule === 'now' ? 'Agora' : selectedTime;
    navigation.navigate('AvailableProfessionals', {
      service,
      description: description.trim(),
      address,
      schedule: scheduleText,
      categoryId,
      categoryName,
      subcategoryId,
    });
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
        <Text className="text-white text-lg font-bold">Novo Pedido</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5">
        {/* Servico selecionado */}
        <View className="flex-row items-center gap-3.5 bg-surface rounded-[14px] p-4 mb-6">
          <View className="w-[50px] h-[50px] rounded-[14px] bg-bgDark items-center justify-center">
            {(() => { const Icon = getIcon(categoryIcon); return <Icon size={24} color={colors.brand} />; })()}
          </View>
          <View className="gap-0.5">
            <Text className="text-textSecondary text-xs">Servico</Text>
            <Text className="text-white text-[17px] font-bold">{service}</Text>
          </View>
        </View>

        {/* Descricao */}
        <View className="mb-6">
          <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-2.5">
            Descreva o problema
          </Text>
          <View className="bg-surface rounded-[14px] p-4">
            <TextInput
              className="text-white text-[15px] leading-[22px] min-h-[100px]"
              placeholder="Ex: Tomada nao funciona na sala, preciso de reparo urgente..."
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text className="text-textSecondary text-xs text-right mt-2">{description.length}/300</Text>
          </View>
        </View>

        {/* Endereco */}
        <View className="mb-6">
          <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-2.5">
            Endereco
          </Text>
          <TouchableOpacity
            className="flex-row items-center gap-3 bg-surface rounded-[14px] p-4"
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Location')}
          >
            <MapPin size={18} color={colors.brand} />
            {loadingAddress ? (
              <ActivityIndicator size="small" color={colors.brand} style={{ flex: 1 }} />
            ) : (
              <Text className="flex-1 text-white text-sm font-medium" numberOfLines={1}>{address}</Text>
            )}
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Horario */}
        <View className="mb-6">
          <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-2.5">
            Quando voce precisa?
          </Text>
          <View className="flex-row gap-2.5">
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center gap-2 bg-surface rounded-xl py-3.5 ${
                schedule === 'now' ? 'bg-brand' : ''
              }`}
              activeOpacity={0.7}
              onPress={() => { setSchedule('now'); setSelectedTime(''); }}
            >
              <Clock size={18} color={schedule === 'now' ? colors.backgroundDark : colors.textSecondary} />
              <Text className={`text-sm font-semibold ${schedule === 'now' ? 'text-bgDark' : 'text-textSecondary'}`}>
                Agora
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center gap-2 bg-surface rounded-xl py-3.5 ${
                schedule === 'scheduled' ? 'bg-brand' : ''
              }`}
              activeOpacity={0.7}
              onPress={() => setSchedule('scheduled')}
            >
              <CalendarDays size={18} color={schedule === 'scheduled' ? colors.backgroundDark : colors.textSecondary} />
              <Text className={`text-sm font-semibold ${schedule === 'scheduled' ? 'text-bgDark' : 'text-textSecondary'}`}>
                Agendar
              </Text>
            </TouchableOpacity>
          </View>

          {schedule === 'scheduled' && (
            <View className="mt-4">
              <Text className="text-textSecondary text-[13px] mb-2.5">Horarios disponiveis hoje</Text>
              <View className="flex-row flex-wrap gap-2">
                {timeSlots.map((time) => (
                  <TouchableOpacity
                    key={time}
                    className={`bg-surface rounded-[10px] px-4 py-2.5 ${
                      selectedTime === time ? 'bg-brand' : ''
                    }`}
                    activeOpacity={0.7}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text className={`text-sm font-medium ${
                      selectedTime === time ? 'text-bgDark' : 'text-textSecondary'
                    }`}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <View className="h-[100px]" />
      </ScrollView>

      {/* Botao fixo */}
      <View className="absolute bottom-0 left-0 right-0 p-5 pb-[30px] bg-bgDark border-t border-white/5">
        <TouchableOpacity
          className={`flex-row items-center justify-center gap-2 bg-brand rounded-[14px] py-4 ${
            !canProceed ? 'opacity-40' : ''
          }`}
          activeOpacity={0.7}
          onPress={handleProceed}
          disabled={!canProceed}
        >
          <Search size={18} color={colors.backgroundDark} />
          <Text className="text-bgDark text-base font-bold">Confirmar Pedido</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
