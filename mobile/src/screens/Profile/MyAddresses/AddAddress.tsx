import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
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
    <SafeAreaView className="flex-1 bg-bgDark" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3.5">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center"
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">
          {isEdit ? 'Editar Endereço' : 'Novo Endereço'}
        </Text>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-5 pb-10"
          keyboardShouldPersistTaps="handled"
        >
          {/* Label selector */}
          <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-2.5 mt-5">
            Tipo
          </Text>
          <View className="flex-row gap-2.5">
            {LABELS.map((item) => {
              const Icon = item.icon;
              const selected = label === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  className={`flex-row items-center gap-1.5 py-2.5 px-4 rounded-xl ${
                    selected ? 'bg-brand' : 'bg-surface'
                  }`}
                  activeOpacity={0.7}
                  onPress={() => setLabel(item.key)}
                >
                  <Icon
                    size={16}
                    color={selected ? colors.backgroundDark : colors.textSecondary}
                  />
                  <Text
                    className={`text-sm ${
                      selected ? 'text-bgDark font-bold' : 'text-textSecondary font-medium'
                    }`}
                  >
                    {item.key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* CEP */}
          <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-2.5 mt-5">
            CEP
          </Text>
          <View className="flex-row gap-2.5">
            <View className="flex-1 flex-row items-center bg-surface rounded-[14px] px-3.5 gap-2.5 mb-2.5">
              <Search size={16} color={colors.textSecondary} />
              <TextInput
                className="flex-1 text-white text-[15px] py-3.5"
                value={cep}
                onChangeText={handleCepChange}
                placeholder="00000-000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={9}
              />
              {loadingCep && <ActivityIndicator size="small" color={colors.brand} />}
              {cepFound && (
                <View className="bg-success/20 px-2 py-[3px] rounded-lg">
                  <Text className="text-success text-xs font-bold">OK</Text>
                </View>
              )}
            </View>
          </View>

          {/* Map button */}
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 bg-surface rounded-[14px] py-3.5 border border-dashed border-brand/30"
            activeOpacity={0.7}
            onPress={handleOpenMap}
          >
            <Map size={18} color={colors.brand} />
            <Text className="text-brand text-sm font-semibold">Buscar no mapa</Text>
          </TouchableOpacity>

          {/* Address fields */}
          <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-2.5 mt-5">
            Endereço
          </Text>

          <View className="flex-row items-center bg-surface rounded-[14px] px-3.5 gap-2.5 mb-2.5">
            <TextInput
              className="flex-1 text-white text-[15px] py-3.5"
              value={street}
              onChangeText={setStreet}
              placeholder="Rua / Avenida"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View className="flex-row gap-2.5">
            <View className="flex-1 flex-row items-center bg-surface rounded-[14px] px-3.5 gap-2.5 mb-2.5">
              <TextInput
                ref={numberRef}
                className="flex-1 text-white text-[15px] py-3.5"
                value={number}
                onChangeText={setNumber}
                placeholder="Número"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
              />
            </View>
            <View className="flex-[2] flex-row items-center bg-surface rounded-[14px] px-3.5 gap-2.5 mb-2.5">
              <TextInput
                className="flex-1 text-white text-[15px] py-3.5"
                value={complement}
                onChangeText={setComplement}
                placeholder="Complemento (opcional)"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View className="flex-row gap-2.5">
            <View className="flex-[2] flex-row items-center bg-surface rounded-[14px] px-3.5 gap-2.5 mb-2.5">
              <TextInput
                className="flex-1 text-white text-[15px] py-3.5"
                value={city}
                onChangeText={setCity}
                placeholder="Cidade"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View className="flex-1 flex-row items-center bg-surface rounded-[14px] px-3.5 gap-2.5 mb-2.5">
              <TextInput
                className="flex-1 text-white text-[15px] py-3.5"
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
            <View className="mb-2.5">
              <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-2.5 mt-5">
                Localização no mapa
              </Text>
              <View className="h-40 rounded-[14px] overflow-hidden">
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
            className={`flex-row items-center justify-center gap-2 bg-brand rounded-[14px] py-4 mt-6 ${
              !isValid ? 'opacity-40' : ''
            }`}
            activeOpacity={0.7}
            onPress={handleSave}
            disabled={!isValid || saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.backgroundDark} />
            ) : (
              <>
                <MapPin size={18} color={colors.backgroundDark} />
                <Text className="text-bgDark text-base font-bold">
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
