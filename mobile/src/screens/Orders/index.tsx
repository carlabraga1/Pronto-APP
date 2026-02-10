import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClipboardList } from 'lucide-react-native';
import { colors } from '../../constants/colors';

export default function OrdersScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Meus Pedidos</Text>
      <View style={styles.empty}>
        <ClipboardList size={48} color={colors.textSecondary} />
        <Text style={styles.emptyText}>Nenhum pedido ainda</Text>
        <Text style={styles.emptySubtext}>Seus pedidos aparecerão aqui</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundDark, paddingHorizontal: 20 },
  title: { color: colors.textPrimary, fontSize: 24, fontWeight: 'bold', paddingVertical: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { color: colors.textPrimary, fontSize: 18, fontWeight: '600' },
  emptySubtext: { color: colors.textSecondary, fontSize: 14 },
});
