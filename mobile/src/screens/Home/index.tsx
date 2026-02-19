import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {
  MapPin,
  Search,
  ArrowRight,
  Bell,
  ChevronRight,
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { getIcon } from '../../constants/iconMap';
import { CATEGORIES } from '../../constants/categories';
import { getCurrentLocation } from '../../services/location';
import api from '../../services/api';

type BackendCategory = {
  id: number;
  name: string;
  icon: string;
  subcategories: { id: number; name: string; icon: string | null }[];
};

type SearchItem = {
  id: string;
  name: string;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  subcategoryId?: number;
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [address, setAddress] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Sincronizar categorias do frontend com o backend
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.post('/categories/sync', CATEGORIES);
        setCategories(data);
      } catch {
        try {
          const { data } = await api.get('/categories');
          setCategories(data);
        } catch {}
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, []);

  // Buscar pedido ativo
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const { data } = await api.get('/requests?me=1');
          const found = data.find((o: any) =>
            !['FINALIZADO', 'CANCELADO'].includes(o.status)
          );
          if (active) setActiveOrder(found || null);
        } catch {}
      })();
      return () => { active = false; };
    }, [])
  );

  // Montar lista de serviços pesquisáveis
  const allServices: SearchItem[] = categories.flatMap((cat) => {
    const subs = (cat.subcategories || []).map((sub) => ({
      id: `sub-${sub.id}`,
      name: sub.name,
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      subcategoryId: sub.id,
    }));
    if (subs.length === 0) {
      return [{
        id: `cat-${cat.id}`,
        name: cat.name,
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
      }];
    }
    return subs;
  });

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

  const handleCategory = (cat: BackendCategory) => {
    if (cat.subcategories && cat.subcategories.length > 0) {
      navigation.navigate('SubCategory', {
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
      });
    } else {
      navigation.navigate('CreateOrder', {
        service: cat.name,
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
      });
    }
  };

  const handleSearchSelect = (item: SearchItem) => {
    setSearchQuery('');
    navigation.navigate('CreateOrder', {
      service: item.name,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      categoryIcon: item.categoryIcon,
      subcategoryId: item.subcategoryId,
    });
  };

  return (
    <SafeAreaView className="flex-1 pt-[15px] bg-bgDark">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-5">

        {/* Header - Logo + Notificação */}
        <View className="flex-row justify-between items-center pt-2">
          <View>
            <Text className="text-brand text-[28px] font-bold">Pronto</Text>
            <Text className="text-textSecondary text-[13px] mt-0.5">Serviços rápidos</Text>
          </View>
          <TouchableOpacity
            className="w-11 h-11 rounded-full bg-surface items-center justify-center"
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Bell size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Localização */}
        <TouchableOpacity
          className="flex-row items-center bg-surface rounded-[14px] px-3.5 py-3.5 gap-2.5 mt-4 mb-3"
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Location')}
        >
          <MapPin size={18} color={colors.brand} />
          {loadingLocation ? (
            <View className="flex-1 flex-row items-center gap-2">
              <ActivityIndicator size="small" color={colors.brand} />
              <Text className="text-textSecondary text-sm">Buscando localização...</Text>
            </View>
          ) : (
            <View className="flex-1">
              <Text className="text-textSecondary text-[11px]">Enviar para</Text>
              <Text className="text-white text-[15px] font-semibold mt-0.5" numberOfLines={1}>
                {address}
              </Text>
            </View>
          )}
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Busca */}
        <View className="flex-row items-center bg-surface rounded-[14px] px-4 py-3.5 gap-3 mb-7">
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            className="flex-1 text-white text-base"
            placeholder="Qual serviço você precisa?"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text className="text-textSecondary text-base p-1">✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Resultados da busca */}
        {searchResults.length > 0 && (
          <View className="bg-surface rounded-[14px] -mt-5 mb-5 overflow-hidden">
            {searchResults.map((item) => {
              const ItemIcon = getIcon(item.categoryIcon);
              return (
                <TouchableOpacity
                  key={item.id}
                  className="flex-row items-center gap-3 px-4 py-3.5 border-b border-white/5"
                  activeOpacity={0.7}
                  onPress={() => handleSearchSelect(item)}
                >
                  <ItemIcon size={20} color={colors.brand} />
                  <View className="flex-1">
                    <Text className="text-white text-[15px] font-medium">{item.name}</Text>
                    <Text className="text-textSecondary text-xs mt-0.5">{item.categoryName}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {searchQuery.length >= 2 && searchResults.length === 0 && (
          <View className="items-center py-4 -mt-5 mb-5">
            <Text className="text-textSecondary text-sm">Nenhum serviço encontrado</Text>
          </View>
        )}

        {/* Categorias */}
        <Text className="text-white text-xl font-bold mb-4">Categorias</Text>
        {loadingCategories ? (
          <ActivityIndicator size="small" color={colors.brand} style={{ marginVertical: 20 }} />
        ) : (
          <View className="flex-row flex-wrap gap-2.5 mb-7">
            {categories.slice(0, 8).map((cat) => {
              const CatIcon = getIcon(cat.icon);
              return (
                <TouchableOpacity
                  key={cat.id}
                  className="w-[22%] bg-surface rounded-[14px] py-3 px-1 items-center gap-1.5"
                  activeOpacity={0.7}
                  onPress={() => handleCategory(cat)}
                >
                  <View className="w-11 h-11 rounded-xl bg-bgDark items-center justify-center">
                    <CatIcon size={26} color={colors.brand} />
                  </View>
                  <Text className="text-white text-[10px] font-semibold text-center leading-[13px]">
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Pedido ativo */}
        {activeOrder && (
          <TouchableOpacity
            className="flex-row items-center justify-between bg-surface rounded-2xl p-4 border-l-[3px] border-brand"
            activeOpacity={0.7}
            onPress={() => navigation.navigate('OrderTracking', { orderId: String(activeOrder.id) })}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-2.5 h-2.5 rounded-full bg-success" />
              <View>
                <Text className="text-white text-[15px] font-semibold">Pedido em andamento</Text>
                <Text className="text-textSecondary text-[13px] mt-0.5">
                  {activeOrder.professional?.name
                    ? `${activeOrder.professional.name} - ${activeOrder.category?.name || ''}`
                    : 'Procurando profissional...'}
                </Text>
              </View>
            </View>
            <ArrowRight size={20} color={colors.brand} />
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
