import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          {(() => { const Icon = getIcon(categoryIcon); return <Icon size={20} color={colors.brand} />; })()}
          <Text style={styles.headerTitle}>{categoryName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : (
        <FlatList
          data={subcategories}
          contentContainerStyle={styles.list}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const SubIcon = getIcon(item.icon || categoryIcon);
            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => handleSelect(item)}
              >
                <View style={styles.iconContainer}>
                  <SubIcon size={24} color={colors.brand} />
                </View>
                <Text style={styles.cardName}>{item.name}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundDark },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIcon: { width: 20 },
  headerTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingTop: 8, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subIcon: { width: 24 },
  cardName: { color: colors.textPrimary, fontSize: 16, fontWeight: '500' },
});
