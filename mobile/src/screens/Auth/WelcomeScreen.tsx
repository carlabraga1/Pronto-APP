import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logoText}>Pronto</Text>

        <Text style={styles.title}>
          Resolva qualquer serviço{'\n'}em minutos
        </Text>
        <Text style={styles.subtitle}>
          Conecte-se a profissionais confiáveis perto de você
        </Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryBtnText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.outlineBtnText}>Criar conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: colors.brand,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 48,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 12,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  buttons: {
    gap: 12,
    paddingBottom: 24,
  },
  primaryBtn: {
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.backgroundDark,
    fontSize: 17,
    fontWeight: '700',
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  outlineBtnText: {
    color: colors.brand,
    fontSize: 17,
    fontWeight: '700',
  },
});
