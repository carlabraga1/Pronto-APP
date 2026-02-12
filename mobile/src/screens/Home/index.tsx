import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  MapPin,
  Search,
  ArrowRight,
  Bell,
  ChevronRight,
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { categories } from '../../constants/categories';
import { getCurrentLocation } from '../../services/location';

const allServices = categories.flatMap((cat) =>
  cat.subs.map((sub) => ({ ...sub, categoryId: cat.id, categoryName: cat.name }))
);

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [address, setAddress] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [hasActiveOrder] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = searchQuery.length >= 2
    ? allServices.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (route.params?.address) {
      setAddress(route.params.address);
      setLoadingLocation(false);
    }
  }, [route.params?.address]);

  useEffect(() => {
    if (!route.params?.address) fetchGpsLocation();
  }, []);

  const fetchGpsLocation = async () => {
    setLoadingLocation(true);
    const result = await getCurrentLocation();
    setAddress(result.address);
    setLoadingLocation(false);
  };

  const handleCategory = (categoryId: string, categoryName: string, hasSubcategories: boolean) => {
    if (hasSubcategories) {
      navigation.navigate('SubCategory', { categoryId });
    } else {
      navigation.navigate('CreateOrder', { service: categoryName, categoryId });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header - Logo + Notificação */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.logo}>Pronto</Text>
            <Text style={styles.subtitle}>Serviços rápidos com IA</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Bell size={22} color={colors.textPrimary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Localização */}
        <TouchableOpacity
          style={styles.locationBox}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Location')}
        >
          <MapPin size={18} color={colors.brand} />
          {loadingLocation ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.brand} />
              <Text style={styles.loadingText}>Buscando localização...</Text>
            </View>
          ) : (
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Enviar para</Text>
              <Text style={styles.locationAddress} numberOfLines={1}>{address}</Text>
            </View>
          )}
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Busca */}
        <View style={styles.searchBox}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Qual serviço você precisa?"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Resultados da busca */}
        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            {searchResults.map((item) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.searchResultItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSearchQuery('');
                    navigation.navigate('CreateOrder', { service: item.name, categoryId: item.categoryId });
                  }}
                >
                  <Icon size={20} color={colors.brand} />
                  <View style={styles.searchResultText}>
                    <Text style={styles.searchResultName}>{item.name}</Text>
                    <Text style={styles.searchResultCategory}>{item.categoryName}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {searchQuery.length >= 2 && searchResults.length === 0 && (
          <View style={styles.searchEmpty}>
            <Text style={styles.searchEmptyText}>Nenhum serviço encontrado</Text>
          </View>
        )}

        {/* Categorias */}
        <Text style={styles.sectionTitle}>Categorias</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                activeOpacity={0.7}
                onPress={() => handleCategory(cat.id, cat.name, cat.subs.length > 0)}
              >
                <View style={styles.iconContainer}>
                  <Icon size={26} color={colors.brand} />
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Pedido ativo */}
        {hasActiveOrder && (
          <TouchableOpacity
            style={styles.activeOrderCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('OrderTracking', { orderId: '1' })}
          >
            <View style={styles.activeOrderInfo}>
              <View style={styles.activeOrderDot} />
              <View>
                <Text style={styles.activeOrderTitle}>Pedido em andamento</Text>
                <Text style={styles.activeOrderSub}>Seu profissional está a caminho</Text>
              </View>
            </View>
            <ArrowRight size={20} color={colors.brand} />
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: colors.backgroundDark,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  logo: {
    color: colors.brand,
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
    marginTop: 16,
    marginBottom: 12,
  },
  locationInfo: { flex: 1 },
  locationLabel: { color: colors.textSecondary, fontSize: 11 },
  locationAddress: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  loadingRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: { color: colors.textSecondary, fontSize: 14 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    marginBottom: 28,
  },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 16 },
  searchClear: { color: colors.textSecondary, fontSize: 16, padding: 4 },
  searchResults: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginTop: -20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  searchResultText: { flex: 1 },
  searchResultName: { color: colors.textPrimary, fontSize: 15, fontWeight: '500' },
  searchResultCategory: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  searchEmpty: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: -20,
    marginBottom: 20,
  },
  searchEmptyText: { color: colors.textSecondary, fontSize: 14 },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  categoryCard: {
    width: '22%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 6,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 13,
  },
  activeOrderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
  },
  activeOrderInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  activeOrderDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  activeOrderTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  activeOrderSub: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
});
