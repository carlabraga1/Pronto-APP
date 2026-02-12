import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
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
import { categories } from '../../constants/categories';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CreateOrderRoute = RouteProp<RootStackParamList, 'CreateOrder'>;

type Schedule = 'now' | 'scheduled';

const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

export default function CreateOrderScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CreateOrderRoute>();
  const { service, categoryId } = route.params;

  const category = categories.find((c) => c.id === categoryId);
  const CategoryIcon = category?.icon;

  const [description, setDescription] = useState('');
  const [address] = useState('Rua das Flores, 123 - São Paulo');
  const [schedule, setSchedule] = useState<Schedule>('now');
  const [selectedTime, setSelectedTime] = useState('');

  const canProceed = description.trim().length > 0;

  const handleProceed = () => {
    const scheduleText = schedule === 'now' ? 'Agora' : selectedTime;
    navigation.navigate('AvailableProfessionals', {
      service,
      description: description.trim(),
      address,
      schedule: scheduleText,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Pedido</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Serviço selecionado */}
        <View style={styles.serviceCard}>
          <View style={styles.serviceIcon}>
            {CategoryIcon && <CategoryIcon size={24} color={colors.brand} />}
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceLabel}>Serviço</Text>
            <Text style={styles.serviceName}>{service}</Text>
          </View>
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descreva o problema</Text>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.textArea}
              placeholder="Ex: Tomada não funciona na sala, preciso de reparo urgente..."
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{description.length}/300</Text>
          </View>
        </View>

        {/* Endereço */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endereço</Text>
          <TouchableOpacity
            style={styles.addressCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Location')}
          >
            <MapPin size={18} color={colors.brand} />
            <Text style={styles.addressText} numberOfLines={1}>{address}</Text>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Horário */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quando você precisa?</Text>
          <View style={styles.scheduleRow}>
            <TouchableOpacity
              style={[styles.scheduleOption, schedule === 'now' && styles.scheduleActive]}
              activeOpacity={0.7}
              onPress={() => { setSchedule('now'); setSelectedTime(''); }}
            >
              <Clock size={18} color={schedule === 'now' ? colors.backgroundDark : colors.textSecondary} />
              <Text style={[styles.scheduleText, schedule === 'now' && styles.scheduleTextActive]}>
                Agora
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.scheduleOption, schedule === 'scheduled' && styles.scheduleActive]}
              activeOpacity={0.7}
              onPress={() => setSchedule('scheduled')}
            >
              <CalendarDays size={18} color={schedule === 'scheduled' ? colors.backgroundDark : colors.textSecondary} />
              <Text style={[styles.scheduleText, schedule === 'scheduled' && styles.scheduleTextActive]}>
                Agendar
              </Text>
            </TouchableOpacity>
          </View>

          {schedule === 'scheduled' && (
            <View style={styles.timeSlotsContainer}>
              <Text style={styles.timeSlotsLabel}>Horários disponíveis hoje</Text>
              <View style={styles.timeSlots}>
                {timeSlots.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[styles.timeSlot, selectedTime === time && styles.timeSlotActive]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text style={[styles.timeSlotText, selectedTime === time && styles.timeSlotTextActive]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botão fixo */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.proceedBtn, !canProceed && styles.proceedBtnDisabled]}
          activeOpacity={0.7}
          onPress={handleProceed}
          disabled={!canProceed}
        >
          <Search size={18} color={colors.backgroundDark} />
          <Text style={styles.proceedBtnText}>Confirmar Pedido</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
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
  content: {
    paddingHorizontal: 20,
  },

  // Serviço
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: {
    gap: 2,
  },
  serviceLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  serviceName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  // Descrição
  inputCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
  },
  textArea: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 100,
  },
  charCount: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },

  // Endereço
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
  },
  addressText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },

  // Horário
  scheduleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  scheduleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
  },
  scheduleActive: {
    backgroundColor: colors.brand,
  },
  scheduleText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleTextActive: {
    color: colors.backgroundDark,
  },
  timeSlotsContainer: {
    marginTop: 16,
  },
  timeSlotsLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 10,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  timeSlotActive: {
    backgroundColor: colors.brand,
  },
  timeSlotText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  timeSlotTextActive: {
    color: colors.backgroundDark,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    backgroundColor: colors.backgroundDark,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 16,
  },
  proceedBtnDisabled: {
    opacity: 0.4,
  },
  proceedBtnText: {
    color: colors.backgroundDark,
    fontSize: 16,
    fontWeight: '700',
  },
});
