import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../constants/colors';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

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
        <Text style={styles.headerTitle}>Política de Privacidade</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.mainTitle}>Política de Privacidade — Pronto</Text>

        <Text style={styles.paragraph}>
          O Pronto coleta apenas as informações necessárias para conectar você a
          profissionais de forma rápida e segura.
        </Text>

        <Text style={styles.sectionTitle}>Dados coletados</Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>Nome e contato</Text>
          <Text style={styles.listItem}>Localização e endereço</Text>
          <Text style={styles.listItem}>Histórico de pedidos</Text>
        </View>

        <Text style={styles.sectionTitle}>Uso das informações</Text>
        <Text style={styles.paragraph}>Utilizamos seus dados para:</Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>Encontrar profissionais próximos</Text>
          <Text style={styles.listItem}>
            Acompanhar pedidos em tempo real
          </Text>
          <Text style={styles.listItem}>
            Oferecer suporte e melhorar o serviço
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Compartilhamento</Text>
        <Text style={styles.paragraph}>
          Compartilhamos apenas dados essenciais com o profissional escolhido
          para a realização do serviço.
        </Text>

        <Text style={styles.sectionTitle}>Segurança</Text>
        <Text style={styles.paragraph}>
          Adotamos medidas para proteger suas informações e garantir uma
          experiência confiável.
        </Text>

        <Text style={styles.contact}>
          Para dúvidas, entre em contato em: suporte@pronto.com
        </Text>

        <View style={{ height: 30 }} />
      </ScrollView>
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
    paddingTop: 10,
  },
  mainTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
  },
  paragraph: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  list: {
    gap: 6,
    paddingLeft: 8,
    marginTop: 4,
  },
  listItem: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: colors.brand,
  },
  contact: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 32,
    textAlign: 'center',
  },
});
