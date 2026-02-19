import { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plus,
  MapPin,
  Star,
  Trash2,
  Pencil,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../@types/navigation';
import { colors } from '../../../constants/colors';
import { useProfile, type Address } from '../../../contexts/ProfileContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function MyAddressesScreen() {
  const navigation = useNavigation<Nav>();
  const {
    addresses,
    loadingAddresses,
    fetchAddresses,
    deleteAddress,
    setDefaultAddress,
  } = useProfile();

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleDelete = (item: Address) => {
    Alert.alert(
      'Remover endereço',
      `Deseja remover "${item.label}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(item.id);
            } catch {
              Alert.alert('Erro', 'Não foi possível remover o endereço.');
            }
          },
        },
      ],
    );
  };

  const handleSetDefault = async (item: Address) => {
    if (item.isDefault) return;
    try {
      await setDefaultAddress(item.id);
    } catch {
      Alert.alert('Erro', 'Não foi possível definir como principal.');
    }
  };

  const renderItem = ({ item }: { item: Address }) => (
    <View className="bg-surface rounded-[14px] overflow-hidden">
      <TouchableOpacity
        className="flex-row items-center p-4 gap-3.5"
        activeOpacity={0.7}
        onPress={() => navigation.navigate('AddAddress', { addressId: item.id })}
      >
        <View className={`w-11 h-11 rounded-xl items-center justify-center ${
          item.isDefault ? 'bg-brand/[0.12]' : 'bg-white/5'
        }`}>
          <MapPin size={20} color={item.isDefault ? colors.brand : colors.textSecondary} />
        </View>
        <View className="flex-1 gap-[3px]">
          <View className="flex-row items-center gap-2">
            <Text className="text-white text-[15px] font-semibold">{item.label}</Text>
            {item.isDefault && (
              <View className="bg-brand/15 px-2 py-0.5 rounded-[10px]">
                <Text className="text-brand text-[11px] font-semibold">Principal</Text>
              </View>
            )}
          </View>
          <Text className="text-textSecondary text-[13px]" numberOfLines={1}>
            {item.street}, {item.number}
            {item.complement ? ` - ${item.complement}` : ''}
          </Text>
          <Text className="text-textSecondary text-xs">
            {item.city}, {item.state}
            {item.zipCode ? ` - ${item.zipCode}` : ''}
          </Text>
        </View>
      </TouchableOpacity>

      <View className="flex-row border-t border-white/5">
        <TouchableOpacity
          className="flex-1 items-center justify-center py-3"
          onPress={() => handleSetDefault(item)}
          activeOpacity={0.7}
        >
          <Star
            size={18}
            color={item.isDefault ? colors.brand : colors.textSecondary}
            fill={item.isDefault ? colors.brand : 'transparent'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center justify-center py-3"
          onPress={() => navigation.navigate('AddAddress', { addressId: item.id })}
          activeOpacity={0.7}
        >
          <Pencil size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center justify-center py-3"
          onPress={() => handleDelete(item)}
          activeOpacity={0.7}
        >
          <Trash2 size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-bgDark" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3.5">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center"
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Meus Endereços</Text>
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          activeOpacity={0.7}
          onPress={() => navigation.navigate('AddAddress', {})}
        >
          <Plus size={22} color={colors.brand} />
        </TouchableOpacity>
      </View>

      {loadingAddresses ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : addresses.length === 0 ? (
        <View className="flex-1 justify-center items-center px-10 gap-3">
          <MapPin size={48} color={colors.textSecondary} />
          <Text className="text-white text-lg font-bold mt-2">Nenhum endereço cadastrado</Text>
          <Text className="text-textSecondary text-sm text-center leading-5">
            Adicione seu endereço principal para facilitar seus pedidos
          </Text>
          <TouchableOpacity
            className="flex-row items-center gap-2 bg-brand rounded-[14px] py-3.5 px-6 mt-2"
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AddAddress', {})}
          >
            <Plus size={18} color={colors.backgroundDark} />
            <Text className="text-bgDark text-[15px] font-bold">Adicionar endereço</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerClassName="px-5 pb-[30px] gap-3"
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
