import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('AddAddress', { addressId: item.id })}
      >
        <View style={[styles.iconWrapper, item.isDefault && styles.iconWrapperDefault]}>
          <MapPin size={20} color={item.isDefault ? colors.brand : colors.textSecondary} />
        </View>
        <View style={styles.cardText}>
          <View style={styles.labelRow}>
            <Text style={styles.cardLabel}>{item.label}</Text>
            {item.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Principal</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardStreet} numberOfLines={1}>
            {item.street}, {item.number}
            {item.complement ? ` - ${item.complement}` : ''}
          </Text>
          <Text style={styles.cardCity}>
            {item.city}, {item.state}
            {item.zipCode ? ` - ${item.zipCode}` : ''}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionBtn}
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
          style={styles.actionBtn}
          onPress={() => navigation.navigate('AddAddress', { addressId: item.id })}
          activeOpacity={0.7}
        >
          <Pencil size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDelete(item)}
          activeOpacity={0.7}
        >
          <Trash2 size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Endereços</Text>
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('AddAddress', {})}
        >
          <Plus size={22} color={colors.brand} />
        </TouchableOpacity>
      </View>

      {loadingAddresses ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.empty}>
          <MapPin size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>Nenhum endereço cadastrado</Text>
          <Text style={styles.emptySubtitle}>
            Adicione seu endereço principal para facilitar seus pedidos
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AddAddress', {})}
          >
            <Plus size={18} color={colors.backgroundDark} />
            <Text style={styles.emptyBtnText}>Adicionar endereço</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  addBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperDefault: {
    backgroundColor: 'rgba(255,193,7,0.12)',
  },
  cardText: {
    flex: 1,
    gap: 3,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  defaultBadge: {
    backgroundColor: 'rgba(255,193,7,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultBadgeText: {
    color: colors.brand,
    fontSize: 11,
    fontWeight: '600',
  },
  cardStreet: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  cardCity: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },

  // Empty state
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  emptyBtnText: {
    color: colors.backgroundDark,
    fontSize: 15,
    fontWeight: '700',
  },
});
