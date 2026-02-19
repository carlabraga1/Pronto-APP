import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../@types/navigation';
import { colors } from '../../constants/colors';
import { getIcon } from '../../constants/iconMap';
import api from '../../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SubCategoryRoute = RouteProp<RootStackParamList, 'SubCategory'>;

type Subcategory = {
  id: number;
  name: string;
  icon: string | null;
};

export default function SubCategoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SubCategoryRoute>();
  const { categoryId, categoryName, categoryIcon } = route.params;
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/categories');
        const cat = data.find((c: any) => c.id === categoryId);
        setSubcategories(cat?.subcategories || []);
      } catch (err) {
        console.log('Erro ao buscar subcategorias:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryId]);

  const handleSelect = (sub: Subcategory) => {
    navigation.navigate('CreateOrder', {
      service: sub.name,
      categoryId,
      categoryName,
      categoryIcon,
      subcategoryId: sub.id,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-bgDark">
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-surface items-center justify-center"
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View className="flex-row items-center gap-2">
          {(() => { const Icon = getIcon(categoryIcon); return <Icon size={20} color={colors.brand} />; })()}
          <Text className="text-white text-[17px] font-semibold">{categoryName}</Text>
        </View>
        <View className="w-10" />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : (
        <FlatList
          data={subcategories}
          contentContainerClassName="px-5 pt-2 gap-2.5"
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const SubIcon = getIcon(item.icon || categoryIcon);
            return (
              <TouchableOpacity
                className="flex-row items-center bg-surface rounded-[14px] p-4 gap-3.5"
                activeOpacity={0.7}
                onPress={() => handleSelect(item)}
              >
                <View className="w-12 h-12 rounded-[14px] bg-bgDark items-center justify-center">
                  <SubIcon size={24} color={colors.brand} />
                </View>
                <Text className="text-white text-base font-medium">{item.name}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
