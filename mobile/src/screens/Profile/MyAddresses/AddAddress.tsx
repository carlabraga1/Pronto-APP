import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MapPin,
  Map,
  Search,
  Home,
  Briefcase,
  Tag,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../@types/navigation';
import { colors } from '../../../constants/colors';
import { useProfile } from '../../../contexts/ProfileContext';
import { searchByCep } from '../../../services/location';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AddAddress'>;

let MapView: any = View;
let Marker: any = View;
let PROVIDER_GOOGLE: any = undefined;
if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  } catch {}
}

const LABELS = [
  { key: 'Casa', icon: Home },
  { key: 'Trabalho', icon: Briefcase },
  { key: 'Outro', icon: Tag },
];

export default function AddAddressScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { addresses, createAddress, updateAddress } = useProfile();

  const addressId = route.params?.addressId;
  const editing = addresses.find((a) => a.id === addressId);
  const isEdit = !!editing;

  const [label, setLabel] = useState(editing?.label || 'Casa');
  const [cep, setCep] = useState(editing?.zipCode || '');
  const [street, setStreet] = useState(editing?.street || '');
  const [number, setNumber] = useState(editing?.number || '');
  const [complement, setComplement] = useState(editing?.complement || '');
  const [city, setCity] = useState(editing?.city || '');
  const [state, setState] = useState(editing?.state || '');
  const [latitude, setLatitude] = useState<number | undefined>(editing?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(editing?.longitude);
  const [loadingCep, setLoadingCep] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cepFound, setCepFound] = useState(false);

  const numberRef = useRef<TextInput>(null);

  const formatCep = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 8);
    if (cleaned.length > 5) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    return cleaned;
  };

  const handleCepChange = async (text: string) => {
    const formatted = formatCep(text);
    setCep(formatted);
    setCepFound(false);

    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length === 8) {
      setLoadingCep(true);
      const result = await searchByCep(cleaned);
      setLoadingCep(false);

      if (result) {
        setStreet(result.logradouro || '');
        setCity(result.localidade || '');
        setState(result.uf || '');
        if (result.complemento) setComplement(result.complemento);
        setCepFound(true);
        numberRef.current?.focus();
      } else {
        Alert.alert('CEP não encontrado', 'Verifique o CEP digitado ou preencha manualmente.');
      }
    }
  };

  // Listen for map return data
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const params = route.params as any;
      if (params?.mapAddress) {
        setStreet(params.mapAddress.street || '');
        setCity(params.mapAddress.city || '');
        setState(params.mapAddress.state || '');
        setLatitude(params.mapAddress.latitude);
        setLongitude(params.mapAddress.longitude);
        if (params.mapAddress.zipCode) setCep(formatCep(params.mapAddress.zipCode));
        // Clear map params to avoid re-applying
        navigation.setParams({ mapAddress: undefined } as any);
      }
    });
    return unsubscribe;
  }, [navigation, route.params]);

  const handleOpenMap = () => {
    navigation.navigate('Location', { returnTo: 'AddAddress' } as any);
  };

  const isValid = label && street && number && city && state && cep.replace(/\D/g, '').length === 8;

  const handleSave = async () => {
    if (!isValid) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos obrigatórios.');
      return;
    }

    setSaving(true);
    try {
      const data = {
        label,
        street,
        number,
        complement: complement || undefined,
        city,
        state,
        zipCode: cep.replace(/\D/g, ''),
        latitude,
        longitude,
      };

      if (isEdit && addressId) {
        await updateAddress(addressId, data);
      } else {
        await createAddress(data);
      }

      navigation.goBack();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o endereço.');
    } finally {
      setSaving(false);
    }
  };

  const hasCoords = latitude !== undefined && longitude !== undefined;

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
        <Text style={styles.headerTitle}>
          {isEdit ? 'Editar Endereço' : 'Novo Endereço'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Label selector */}
          <Text style={styles.sectionTitle}>Tipo</Text>
          <View style={styles.labelRow}>
            {LABELS.map((item) => {
              const Icon = item.icon;
              const selected = label === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.labelChip, selected && styles.labelChipSelected]}
                  activeOpacity={0.7}
                  onPress={() => setLabel(item.key)}
                >
                  <Icon
                    size={16}
                    color={selected ? colors.backgroundDark : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.labelChipText,
                      selected && styles.labelChipTextSelected,
                    ]}
                  >
                    {item.key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* CEP */}
          <Text style={styles.sectionTitle}>CEP</Text>
          <View style={styles.cepRow}>
            <View style={[styles.inputBox, { flex: 1 }]}>
              <Search size={16} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={cep}
                onChangeText={handleCepChange}
                placeholder="00000-000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={9}
              />
              {loadingCep && <ActivityIndicator size="small" color={colors.brand} />}
              {cepFound && (
                <View style={styles.cepOk}>
                  <Text style={styles.cepOkText}>OK</Text>
                </View>
              )}
            </View>
          </View>

          {/* Map button */}
          <TouchableOpacity
            style={styles.mapBtn}
            activeOpacity={0.7}
            onPress={handleOpenMap}
          >
            <Map size={18} color={colors.brand} />
            <Text style={styles.mapBtnText}>Buscar no mapa</Text>
          </TouchableOpacity>

          {/* Address fields */}
          <Text style={styles.sectionTitle}>Endereço</Text>

          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={street}
              onChangeText={setStreet}
              placeholder="Rua / Avenida"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputBox, { flex: 1 }]}>
              <TextInput
                ref={numberRef}
                style={styles.input}
                value={number}
                onChangeText={setNumber}
                placeholder="Número"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
              />
            </View>
            <View style={[styles.inputBox, { flex: 2 }]}>
              <TextInput
                style={styles.input}
                value={complement}
                onChangeText={setComplement}
                placeholder="Complemento (opcional)"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputBox, { flex: 2 }]}>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="Cidade"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={[styles.inputBox, { flex: 1 }]}>
              <TextInput
                style={styles.input}
                value={state}
                onChangeText={setState}
                placeholder="UF"
                placeholderTextColor={colors.textSecondary}
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Mini map */}
          {hasCoords && Platform.OS !== 'web' && (
            <View style={styles.miniMapContainer}>
              <Text style={styles.sectionTitle}>Localização no mapa</Text>
              <View style={styles.miniMap}>
                <MapView
                  style={{ flex: 1 }}
                  region={{
                    latitude: latitude!,
                    longitude: longitude!,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                  provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                >
                  <Marker coordinate={{ latitude: latitude!, longitude: longitude! }} />
                </MapView>
              </View>
            </View>
          )}

          {/* Save button */}
          <TouchableOpacity
            style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
            activeOpacity={0.7}
            onPress={handleSave}
            disabled={!isValid || saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.backgroundDark} />
            ) : (
              <>
                <MapPin size={18} color={colors.backgroundDark} />
                <Text style={styles.saveBtnText}>
                  {isEdit ? 'Salvar alterações' : 'Salvar endereço'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 20,
  },
  labelRow: {
    flexDirection: 'row',
    gap: 10,
  },
  labelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  labelChipSelected: {
    backgroundColor: colors.brand,
  },
  labelChipText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  labelChipTextSelected: {
    color: colors.backgroundDark,
    fontWeight: '700',
  },
  cepRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    paddingVertical: 14,
  },
  cepOk: {
    backgroundColor: 'rgba(76,175,80,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cepOkText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,193,7,0.3)',
    borderStyle: 'dashed',
  },
  mapBtnText: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  miniMapContainer: {
    marginBottom: 10,
  },
  miniMap: {
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 24,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: colors.backgroundDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
