import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
}
import { colors } from '../../constants/colors';
import {
  getCurrentLocation,
  reverseGeocode,
  searchAddress,
  type SearchResult,
} from '../../services/location';

export default function LocationScreen({ navigation }: any) {
  const mapRef = useRef<MapView>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
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

  useEffect(() => {
    (async () => {
      const loc = await getCurrentLocation();
      if (loc.coords) {
        setMarkerCoord(loc.coords);
        setRegion({ ...loc.coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
        setSelectedAddress(loc.address);
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
  };

  const handleMapPress = async (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setMarkerCoord(coords);
    const addr = await reverseGeocode(coords.latitude, coords.longitude);
    setSelectedAddress(addr);
  };

  const handleUseGps = async () => {
    const loc = await getCurrentLocation();
    if (loc.coords) {
      setMarkerCoord(loc.coords);
      const newRegion = { ...loc.coords, latitudeDelta: 0.01, longitudeDelta: 0.01 };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 600);
      setSelectedAddress(loc.address);
    }
  };

  const handleConfirm = () => {
    navigation.navigate('Tabs', { address: selectedAddress });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Escolher localização</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Busca */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <MapPin size={18} color={colors.brand} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={handleQueryChange}
            placeholder="Buscar endereço..."
            placeholderTextColor={colors.textSecondary}
            autoFocus
          />
          {searching && <ActivityIndicator size="small" color={colors.brand} />}
        </View>

        {results.length > 0 && (
          <View style={styles.resultsList}>
            <FlatList
              data={results}
              keyExtractor={(item) => String(item.place_id)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleSelectResult(item)}
                >
                  <MapPin size={16} color={colors.textSecondary} />
                  <Text style={styles.resultText} numberOfLines={2}>
                    {item.display_name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* Mapa */}
      <View style={styles.mapContainer}>
        <MapView ref={mapRef} style={styles.map} region={region} onPress={handleMapPress}>
          <Marker coordinate={markerCoord} />
        </MapView>

        <TouchableOpacity style={styles.gpsFloating} onPress={handleUseGps} activeOpacity={0.7}>
          <LocateFixed size={22} color={colors.brand} />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerAddress}>
          <MapPin size={16} color={colors.brand} />
          <Text style={styles.footerAddressText} numberOfLines={2}>
            {selectedAddress || 'Toque no mapa ou busque um endereço'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.confirmBtn, !selectedAddress && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!selectedAddress}
          activeOpacity={0.7}
        >
          <Text style={styles.confirmBtnText}>Confirmar</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '600' },
  searchContainer: { paddingHorizontal: 16, zIndex: 10 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 15, paddingVertical: 14 },
  resultsList: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginTop: 4,
    maxHeight: 220,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  resultText: { flex: 1, color: colors.textPrimary, fontSize: 14 },
  mapContainer: { flex: 1, marginTop: 12 },
  map: { flex: 1 },
  gpsFloating: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  footer: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 14,
  },
  footerAddress: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  footerAddressText: { flex: 1, color: colors.textPrimary, fontSize: 15 },
  confirmBtn: {
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { color: colors.backgroundDark, fontSize: 16, fontWeight: 'bold' },
});
