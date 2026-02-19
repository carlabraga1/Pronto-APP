import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { ArrowLeft, LocateFixed, MapPin } from 'lucide-react-native';

type Region = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
let MapView: any = View;
let Marker: any = View;
let PROVIDER_GOOGLE: any = undefined;
if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  } catch (e) {
    console.log('react-native-maps not available');
  }
}
import { colors } from '../../constants/colors';
import {
  getCurrentLocation,
  reverseGeocode,
  searchAddress,
  type SearchResult,
} from '../../services/location';
import * as ExpoLocation from 'expo-location';

export default function LocationScreen({ navigation, route }: any) {
  const mapRef = useRef<MapView>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const returnTo = route?.params?.returnTo;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [addressParts, setAddressParts] = useState<{
    street: string;
    city: string;
    state: string;
    zipCode?: string;
  } | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [markerCoord, setMarkerCoord] = useState({
    latitude: -23.5505,
    longitude: -46.6333,
  });

  const updateAddressParts = async (lat: number, lon: number) => {
    try {
      const [result] = await ExpoLocation.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      if (result) {
        setAddressParts({
          street: result.street || '',
          city: result.city || '',
          state: result.region || '',
          zipCode: result.postalCode || undefined,
        });
      }
    } catch {}
  };

  useEffect(() => {
    (async () => {
      const loc = await getCurrentLocation();
      if (loc.coords) {
        setMarkerCoord(loc.coords);
        setRegion({ ...loc.coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
        setSelectedAddress(loc.address);
        updateAddressParts(loc.coords.latitude, loc.coords.longitude);
      }
    })();
  }, []);

  const handleSearch = useCallback(async (text: string) => {
    setSearching(true);
    const data = await searchAddress(text);
    setResults(data);
    setSearching(false);
  }, []);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(text), 500);
  };

  const handleSelectResult = (item: SearchResult) => {
    const coords = {
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    };
    setMarkerCoord(coords);
    setRegion({ ...coords, latitudeDelta: 0.005, longitudeDelta: 0.005 });
    setSelectedAddress(item.display_name.split(',').slice(0, 3).join(','));
    setQuery('');
    setResults([]);
    Keyboard.dismiss();
    mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 600);
    updateAddressParts(coords.latitude, coords.longitude);
  };

  const handleMapPress = async (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setMarkerCoord(coords);
    const addr = await reverseGeocode(coords.latitude, coords.longitude);
    setSelectedAddress(addr);
    updateAddressParts(coords.latitude, coords.longitude);
  };

  const handleUseGps = async () => {
    const loc = await getCurrentLocation();
    if (loc.coords) {
      setMarkerCoord(loc.coords);
      const newRegion = { ...loc.coords, latitudeDelta: 0.01, longitudeDelta: 0.01 };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 600);
      setSelectedAddress(loc.address);
      updateAddressParts(loc.coords.latitude, loc.coords.longitude);
    }
  };

  const handleConfirm = () => {
    if (returnTo === 'AddAddress') {
      navigation.navigate('AddAddress', {
        mapAddress: {
          street: addressParts?.street || '',
          city: addressParts?.city || '',
          state: addressParts?.state || '',
          latitude: markerCoord.latitude,
          longitude: markerCoord.longitude,
          zipCode: addressParts?.zipCode || undefined,
        },
      });
    } else {
      navigation.navigate('Tabs', { address: selectedAddress });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bgDark">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-surface items-center justify-center"
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-white text-[17px] font-semibold">Escolher localização</Text>
        <View className="w-10" />
      </View>

      {/* Busca */}
      <View className="px-4 z-10">
        <View className="flex-row items-center bg-surface rounded-[14px] px-3.5 gap-2.5">
          <MapPin size={18} color={colors.brand} />
          <TextInput
            className="flex-1 text-white text-[15px] py-3.5"
            value={query}
            onChangeText={handleQueryChange}
            placeholder="Buscar endereço..."
            placeholderTextColor={colors.textSecondary}
            autoFocus
          />
          {searching && <ActivityIndicator size="small" color={colors.brand} />}
        </View>

        {results.length > 0 && (
          <View className="bg-surface rounded-[14px] mt-1 max-h-[220px] overflow-hidden">
            <FlatList
              data={results}
              keyExtractor={(item) => String(item.place_id)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center gap-2.5 px-3.5 py-3.5 border-b border-white/5"
                  onPress={() => handleSelectResult(item)}
                >
                  <MapPin size={16} color={colors.textSecondary} />
                  <Text className="flex-1 text-white text-sm" numberOfLines={2}>
                    {item.display_name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* Mapa */}
      <View className="flex-1 mt-3">
        <MapView ref={mapRef} style={{ flex: 1 }} region={region} onPress={handleMapPress} provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}>
          <Marker coordinate={markerCoord} />
        </MapView>

        <TouchableOpacity
          className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-surface items-center justify-center shadow-lg"
          onPress={handleUseGps}
          activeOpacity={0.7}
        >
          <LocateFixed size={22} color={colors.brand} />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View className="bg-surface px-5 py-4 rounded-t-[20px] gap-3.5">
        <View className="flex-row items-center gap-2.5">
          <MapPin size={16} color={colors.brand} />
          <Text className="flex-1 text-white text-[15px]" numberOfLines={2}>
            {selectedAddress || 'Toque no mapa ou busque um endereço'}
          </Text>
        </View>
        <TouchableOpacity
          className={`bg-brand rounded-[14px] py-4 items-center ${!selectedAddress ? 'opacity-40' : ''}`}
          onPress={handleConfirm}
          disabled={!selectedAddress}
          activeOpacity={0.7}
        >
          <Text className="text-bgDark text-base font-bold">
            {returnTo === 'AddAddress' ? 'Usar este endereço' : 'Confirmar'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
