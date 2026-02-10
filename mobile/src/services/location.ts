import * as Location from 'expo-location';

export type LocationResult = {
  address: string;
  coords: { latitude: number; longitude: number } | null;
};

export async function getCurrentLocation(): Promise<LocationResult> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return { address: 'Permissão negada', coords: null };
  }

  const location = await Location.getCurrentPositionAsync({});
  const coords = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };

  const [result] = await Location.reverseGeocodeAsync(coords);
  if (result) {
    const parts = [result.street, result.streetNumber, result.district].filter(Boolean);
    return { address: parts.join(', '), coords };
  }

  return { address: 'Localização não encontrada', coords };
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const [result] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
    if (result) {
      const parts = [result.street, result.streetNumber, result.district, result.city].filter(Boolean);
      return parts.join(', ');
    }
  } catch {}
  return 'Endereço não encontrado';
}

export async function searchAddress(query: string): Promise<SearchResult[]> {
  if (query.length < 3) return [];

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=br`,
    { headers: { 'Accept-Language': 'pt-BR' } }
  );
  return res.json();
}

export type SearchResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};
