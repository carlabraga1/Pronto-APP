import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { categories } from '../../constants/categories';

export default function SubCategoryScreen({ route, navigation }: any) {
  const { categoryId } = route.params;
  const category = categories.find((c) => c.id === categoryId);

  if (!category) return null;

  const handleSelect = (name: string) => {
    navigation.navigate('CreateOrder', { service: name, categoryId });
  };

  const Icon = category.icon;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Icon size={20} color={colors.brand} />
          <Text style={styles.headerTitle}>{category.name}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={category.subs}
        contentContainerStyle={styles.list}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const SubIcon = item.icon;
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => handleSelect(item.name)}
            >
              <View style={styles.iconContainer}>
                <SubIcon size={24} color={colors.brand} />
              </View>
              <Text style={styles.cardName}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />
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
  cardName: { color: colors.textPrimary, fontSize: 16, fontWeight: '500' },
});
