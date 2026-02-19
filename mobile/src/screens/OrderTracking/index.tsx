import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';


let MapView: any = View;
let Marker: any = View;
let Polyline: any = View;
let PROVIDER_GOOGLE: any = undefined;
if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    Polyline = maps.Polyline;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  } catch (e) {
    console.log('react-native-maps not available');
  }
}
import {
  ArrowLeft,
  UserRound,
  Star,
  Phone,
  Check,
  Search,
  ThumbsUp,
  Truck,
  Flag,
  XCircle,
  ChevronRight,
  Navigation,
  LocateFixed,
  MapPin,
  Clock,
  MessageCircle,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../@types/navigation';
import { colors } from '../../constants/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TrackingStatus = 'PROCURANDO' | 'ACEITO' | 'A_CAMINHO' | 'INICIADO' | 'FINALIZADO';

const steps: { status: TrackingStatus; label: string; icon: typeof Search }[] = [
  { status: 'PROCURANDO', label: 'Procurando profissional', icon: Search },
  { status: 'ACEITO', label: 'Profissional aceitou', icon: ThumbsUp },
  { status: 'A_CAMINHO', label: 'A caminho', icon: Truck },
  { status: 'INICIADO', label: 'Serviço iniciado', icon: Clock },
  { status: 'FINALIZADO', label: 'Finalizado', icon: Flag },
];

const statusColors: Record<TrackingStatus, string> = {
  PROCURANDO: colors.brand,
  ACEITO: colors.success,
  A_CAMINHO: colors.info,
  INICIADO: colors.info,
  FINALIZADO: colors.success,
};

const DESTINATION = { latitude: -3.1100502, longitude: -60.0244787 };
const PRO_START = { latitude: -3.1200, longitude: -60.0350 };
const INITIAL_ETA = 8;

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#373737' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
  { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#4e4e4e' }] },
  { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] },
];

async function fetchRoadRoute(
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number },
): Promise<{ latitude: number; longitude: number }[]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.routes && json.routes.length > 0) {
      const coords = json.routes[0].geometry.coordinates;
      return coords.map((c: [number, number]) => ({ latitude: c[1], longitude: c[0] }));
    }
  } catch (err) {
    console.log('Erro ao buscar rota OSRM:', err);
  }
  const points = [];
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    points.push({
      latitude: start.latitude + (end.latitude - start.latitude) * t,
      longitude: start.longitude + (end.longitude - start.longitude) * t,
    });
  }
  return points;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_HEIGHT = SCREEN_HEIGHT * 0.5;

export default function OrderTrackingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const { orderId } = route.params;
  const mapRef = useRef<MapView>(null);


  const [currentStatus, setCurrentStatus] = useState<TrackingStatus>('PROCURANDO');
  const [proPosition, setProPosition] = useState(PRO_START);
  const [eta, setEta] = useState(INITIAL_ETA);
  const [stepIndex, setStepIndex] = useState(0);
  const [orderData, setOrderData] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [routePoints, setRoutePoints] = useState<{ latitude: number; longitude: number }[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);

  useEffect(() => {
    fetchRoadRoute(PRO_START, DESTINATION).then(setRoutePoints);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/requests/${orderId}`);
        setOrderData(data);
        if (data.status && steps.some((s: any) => s.status === data.status)) {
          setCurrentStatus(data.status);
        }
      } catch (err) {
        console.log('Erro ao buscar pedido:', err);
      } finally {
        setLoadingOrder(false);
      }
    })();
  }, []);

  const currentIndex = steps.findIndex((s) => s.status === currentStatus);
  const isFinished = currentStatus === 'FINALIZADO';
  const isEnRoute = currentStatus === 'A_CAMINHO';
  const isAccepted = currentStatus === 'ACEITO';

  const advanceStatus = async () => {
    if (currentIndex < steps.length - 1) {
      const nextStatus = steps[currentIndex + 1].status;
      try {
        await api.patch(`/requests/${orderId}/status`, { status: nextStatus });
        setCurrentStatus(nextStatus);
        if (nextStatus === 'FINALIZADO') setShowReviewModal(true);
      } catch (err: any) {
        Alert.alert('Erro', err?.response?.data?.message || 'Não foi possível avançar status');
      }
    }
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) return;
    setSubmittingReview(true);
    try {
      await api.post(`/requests/${orderId}/review`, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setReviewSent(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao enviar avaliação';
      Alert.alert('Erro', msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    if (!isEnRoute || routePoints.length === 0) return;

    const totalRoutePoints = routePoints.length;
    const sampleCount = Math.min(30, totalRoutePoints);
    const sampledPoints: { latitude: number; longitude: number }[] = [];
    for (let i = 0; i < sampleCount; i++) {
      const idx = Math.round((i / (sampleCount - 1)) * (totalRoutePoints - 1));
      sampledPoints.push(routePoints[idx]);
    }

    setStepIndex(0);
    setProPosition(sampledPoints[0]);
    setEta(INITIAL_ETA);

    const interval = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next >= sampledPoints.length) {
          clearInterval(interval);
          setTimeout(async () => {
            try {
              await api.patch(`/requests/${orderId}/status`, { status: 'INICIADO' });
            } catch {}
            setCurrentStatus('INICIADO');
          }, 500);
          return prev;
        }

        setProPosition(sampledPoints[next]);

        const remaining = sampledPoints.length - next;
        const newEta = Math.max(1, Math.round((remaining / sampledPoints.length) * INITIAL_ETA));
        setEta(newEta);

        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isEnRoute, routePoints]);

  const recenterMap = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.fitToCoordinates([proPosition, DESTINATION], {
      edgePadding: { top: 80, right: 60, bottom: 80, left: 60 },
      animated: true,
    });
  }, [proPosition]);

  useEffect(() => {
    if (isEnRoute) {
      setTimeout(() => recenterMap(), 400);
    }
  }, [isEnRoute]);

  const handleCancel = () => {
    Alert.alert(
      'Cancelar pedido',
      'Tem certeza que deseja cancelar este pedido?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Cancelar pedido',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.patch(`/requests/${orderId}/status`, { status: 'CANCELADO' });
              Alert.alert('Pedido cancelado', 'Seu pedido foi cancelado.');
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Erro', err.response?.data?.message || 'Não foi possível cancelar');
            }
          },
        },
      ],
    );
  };

  const proName = orderData?.professional?.name || 'Aguardando...';
  const proRating = orderData?.professional?.rating?.toFixed(1) || '0.0';
  const proId = orderData?.professional?.id ? String(orderData.professional.id) : '1';
  const proPhone = orderData?.professional?.phoneNumber || '';
  const serviceName = orderData?.category?.name || 'Serviço';
  const orderAddress = orderData?.address || 'Endereço';

  const renderTimeline = () => (
    <View className="bg-surface rounded-[14px] p-4">
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;
        const stepColor = isPast || isCurrent ? statusColors[step.status] : colors.textSecondary;
        const isLast = index === steps.length - 1;

        return (
          <View key={step.status} className="flex-row min-h-[56px]">
            <View className="items-center w-8">
              <View
                className="w-[30px] h-[30px] rounded-full border-2 items-center justify-center"
                style={{
                  backgroundColor: isPast || isCurrent ? stepColor : 'transparent',
                  borderColor: isFuture ? colors.textSecondary : stepColor,
                }}
              >
                {isPast ? (
                  <Check size={14} color={colors.backgroundDark} />
                ) : isCurrent ? (
                  <StepIcon size={14} color={colors.backgroundDark} />
                ) : (
                  <StepIcon size={14} color={colors.textSecondary} />
                )}
              </View>
              {!isLast && (
                <View
                  className="w-0.5 flex-1 my-1"
                  style={{ backgroundColor: isPast ? stepColor : 'rgba(255,255,255,0.1)' }}
                />
              )}
            </View>

            <View className="flex-1 pl-3 pb-4 gap-0.5">
              <Text
                className={`text-sm ${
                  isCurrent ? 'text-white font-bold' : isFuture ? 'text-textSecondary font-medium' : 'text-textSecondary font-medium'
                }`}
              >
                {step.label}
              </Text>
              {isCurrent && step.status !== 'FINALIZADO' && (
                <Text className="text-xs font-semibold" style={{ color: stepColor }}>
                  Em progresso...
                </Text>
              )}
              {(isPast || (isCurrent && step.status === 'FINALIZADO')) && (
                <Text className="text-textSecondary text-xs">Concluído</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderMap = () => (
    <View style={{ height: MAP_HEIGHT, position: 'relative' }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        customMapStyle={darkMapStyle}
        initialRegion={{
          latitude: (PRO_START.latitude + DESTINATION.latitude) / 2,
          longitude: (PRO_START.longitude + DESTINATION.longitude) / 2,
          latitudeDelta: 0.025,
          longitudeDelta: 0.025,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        toolbarEnabled={false}
        mapPadding={{ top: 0, right: 0, bottom: 120, left: 0 }}
      >
        {routePoints.length > 0 && (
          <Polyline coordinates={routePoints} strokeColor="rgba(0,0,0,0.4)" strokeWidth={8} />
        )}
        {routePoints.length > 0 && (
          <Polyline coordinates={routePoints} strokeColor={colors.brand} strokeWidth={5} />
        )}

        <Marker coordinate={DESTINATION} anchor={{ x: 0.5, y: 0.5 }}>
          <View className="w-6 h-6 rounded-full bg-red-500/30 items-center justify-center">
            <View className="w-3 h-3 rounded-full bg-red-500" />
          </View>
        </Marker>

        <Marker coordinate={proPosition} anchor={{ x: 0.5, y: 0.5 }}>
          <View className="w-11 h-11 rounded-full bg-brand/20 items-center justify-center">
            <View className="w-8 h-8 rounded-full bg-brand items-center justify-center shadow-lg">
              <Navigation size={14} color="#000" />
            </View>
          </View>
        </Marker>
      </MapView>

      {/* ETA badge */}
      <View className="absolute top-4 left-4 bg-surface rounded-xl px-3.5 py-2 flex-row items-baseline gap-[3px] shadow-lg">
        <Text className="text-white text-[22px] font-extrabold">{eta}</Text>
        <Text className="text-textSecondary text-[13px] font-semibold">min</Text>
      </View>

      {/* Recenter */}
      <TouchableOpacity
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface items-center justify-center shadow-lg"
        onPress={recenterMap}
        activeOpacity={0.7}
      >
        <LocateFixed size={18} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Floating pro card */}
      <View className="absolute bottom-4 left-4 right-4 bg-surface rounded-2xl p-4 shadow-xl">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ProfessionalProfile', { professionalId: proId })}
          className="flex-row items-center gap-3"
        >
          <View className="w-11 h-11 rounded-full bg-[#333] items-center justify-center">
            <UserRound size={22} color="#fff" />
          </View>
          <View className="flex-1 gap-[3px]">
            <Text className="text-white text-base font-bold" numberOfLines={1}>{proName}</Text>
            <View className="flex-row items-center gap-[5px]">
              <Star size={11} color={colors.brand} fill={colors.brand} />
              <Text className="text-brand text-[13px] font-bold">{proRating}</Text>
              <View className="w-[3px] h-[3px] rounded-full bg-textSecondary" />
              <Text className="text-textSecondary text-[13px]">{serviceName}</Text>
            </View>
          </View>
        </TouchableOpacity>
        <View className="flex-row gap-2.5 mt-3 pt-3 border-t border-white/[0.08] justify-center">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-2 bg-[#2a2a2a] rounded-xl py-3"
            activeOpacity={0.7}
            onPress={() => Alert.alert('Ligar', proPhone || 'Sem telefone')}
          >
            <Phone size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-2 bg-[#2a2a2a] rounded-xl py-3"
            activeOpacity={0.7}
            onPress={() => navigation.navigate('OrderChat', { orderId: String(orderId) })}
          >
            <MessageCircle size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-bgDark" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 py-3.5">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center"
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Acompanhar Profissional</Text>
        <View className="w-10 h-10" />
      </View>

      {isEnRoute ? (
        <>
          {renderMap()}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-5 pt-4"
          >
            <View className="mb-5">
              <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-3">
                Status do pedido
              </Text>
              {renderTimeline()}
            </View>

            <View className="mb-5">
              <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-3">
                Informações
              </Text>
              <View className="bg-surface rounded-[14px] p-4">
                <View className="py-2.5">
                  <Text className="text-textSecondary text-xs mb-0.5">Serviço</Text>
                  <Text className="text-white text-sm font-medium">{serviceName}</Text>
                </View>
                <View className="py-2.5 border-t border-white/5">
                  <Text className="text-textSecondary text-xs mb-0.5">Endereço</Text>
                  <Text className="text-white text-sm font-medium">{orderAddress}</Text>
                </View>
                <View className="py-2.5 border-t border-white/5">
                  <Text className="text-textSecondary text-xs mb-0.5">Valor estimado</Text>
                  <Text className="text-brand text-base font-bold">
                    {orderData?.price ? `R$ ${orderData.price.toFixed(2).replace('.', ',')}` : 'A combinar'}
                  </Text>
                </View>
              </View>
            </View>

            {!isFinished && (
              <TouchableOpacity
                className="flex-row items-center justify-center gap-1.5 border border-dashed border-brand rounded-[10px] py-2.5 mb-3"
                activeOpacity={0.7}
                onPress={advanceStatus}
              >
                <ChevronRight size={16} color={colors.brand} />
                <Text className="text-brand text-[13px] font-semibold">Simular próximo status</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 py-4"
              activeOpacity={0.7}
              onPress={handleCancel}
            >
              <XCircle size={18} color={colors.danger} />
              <Text className="text-danger text-base font-semibold">Cancelar pedido</Text>
            </TouchableOpacity>

            <View className="h-[30px]" />
          </ScrollView>
        </>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5">
          {/* Profissional */}
          <TouchableOpacity
            className="bg-surface rounded-[14px] p-4 mb-6"
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ProfessionalProfile', { professionalId: proId })}
          >
            <View className="flex-row items-center gap-3.5">
              <View className="w-[52px] h-[52px] rounded-full bg-bgDark items-center justify-center">
                <UserRound size={28} color={colors.textSecondary} />
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-white text-base font-semibold">{proName}</Text>
                <View className="flex-row items-center gap-1">
                  <Star size={14} color={colors.brand} fill={colors.brand} />
                  <Text className="text-brand text-sm font-semibold">{proRating}</Text>
                </View>
              </View>
              <TouchableOpacity
                className="w-11 h-11 rounded-xl border border-brand items-center justify-center"
                activeOpacity={0.7}
                onPress={() => Alert.alert('Ligar', proPhone || 'Sem telefone')}
              >
                <Phone size={18} color={colors.brand} />
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center justify-center gap-1 border-t border-white/5 pt-3 mt-3">
              <Text className="text-brand text-[13px] font-semibold">Ver perfil completo</Text>
              <ChevronRight size={14} color={colors.brand} />
            </View>
          </TouchableOpacity>

          {/* Timeline */}
          <View className="mb-5">
            <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-3">
              Status do pedido
            </Text>
            {renderTimeline()}
          </View>

          {/* Chat button */}
          {isAccepted && (
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2.5 bg-brand rounded-[14px] py-4 mb-5"
              activeOpacity={0.7}
              onPress={() => navigation.navigate('OrderChat', { orderId: String(orderId) })}
            >
              <MessageCircle size={20} color={colors.backgroundDark} />
              <Text className="text-bgDark text-base font-bold">Abrir Chat</Text>
            </TouchableOpacity>
          )}

          {/* Info */}
          <View className="mb-5">
            <Text className="text-textSecondary text-[13px] font-semibold uppercase tracking-wide mb-3">
              Informações
            </Text>
            <View className="bg-surface rounded-[14px] p-4">
              <View className="py-2.5">
                <Text className="text-textSecondary text-xs mb-0.5">Serviço</Text>
                <Text className="text-white text-sm font-medium">{serviceName}</Text>
              </View>
              <View className="py-2.5 border-t border-white/5">
                <Text className="text-textSecondary text-xs mb-0.5">Endereço</Text>
                <Text className="text-white text-sm font-medium">{orderAddress}</Text>
              </View>
              <View className="py-2.5 border-t border-white/5">
                <Text className="text-textSecondary text-xs mb-0.5">Horário</Text>
                <Text className="text-white text-sm font-medium">Agora</Text>
              </View>
              <View className="py-2.5 border-t border-white/5">
                <Text className="text-textSecondary text-xs mb-0.5">Valor estimado</Text>
                <Text className="text-brand text-base font-bold">
                  {orderData?.price ? `R$ ${orderData.price.toFixed(2).replace('.', ',')}` : 'A combinar'}
                </Text>
              </View>
            </View>
          </View>

          {!isFinished && (
            <TouchableOpacity
              className="flex-row items-center justify-center gap-1.5 border border-dashed border-brand rounded-[10px] py-2.5 mb-3"
              activeOpacity={0.7}
              onPress={advanceStatus}
            >
              <ChevronRight size={16} color={colors.brand} />
              <Text className="text-brand text-[13px] font-semibold">Simular próximo status</Text>
            </TouchableOpacity>
          )}

          {!isFinished && (
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 py-4"
              activeOpacity={0.7}
              onPress={handleCancel}
            >
              <XCircle size={18} color={colors.danger} />
              <Text className="text-danger text-base font-semibold">Cancelar pedido</Text>
            </TouchableOpacity>
          )}

          {isFinished && (
            <View className="items-center gap-2 py-6">
              <Flag size={24} color={colors.success} />
              <Text className="text-success text-lg font-bold">Serviço finalizado!</Text>
              <Text className="text-textSecondary text-sm">Obrigado por usar o Pronto</Text>
              {!reviewSent && (
                <TouchableOpacity
                  className="flex-row items-center justify-center gap-2 bg-brand rounded-xl py-3 px-6 mt-4"
                  activeOpacity={0.7}
                  onPress={() => setShowReviewModal(true)}
                >
                  <Star size={18} color={colors.backgroundDark} />
                  <Text className="text-bgDark text-[15px] font-bold">Avaliar profissional</Text>
                </TouchableOpacity>
              )}
              {reviewSent && (
                <Text className="text-brand text-sm font-semibold mt-3">Avaliação enviada!</Text>
              )}
            </View>
          )}

          <View className="h-[30px]" />
        </ScrollView>
      )}

      {/* Modal de avaliação */}
      <Modal
        visible={showReviewModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View className="flex-1 bg-black/70 justify-center items-center px-6">
          <View className="w-full bg-surface rounded-[20px] p-6 items-center gap-3">
            {!reviewSent ? (
              <>
                <Text className="text-white text-xl font-bold">Avalie o profissional</Text>
                <Text className="text-textSecondary text-sm text-center">{proName}</Text>

                <View className="flex-row gap-2 my-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <TouchableOpacity
                      key={n}
                      activeOpacity={0.7}
                      onPress={() => setReviewRating(n)}
                    >
                      <Star
                        size={36}
                        color={colors.brand}
                        fill={n <= reviewRating ? colors.brand : 'transparent'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  className="w-full bg-bgDark rounded-[14px] px-4 py-3 text-white text-sm min-h-[80px]"
                  placeholder="Deixe um comentário (opcional)"
                  placeholderTextColor={colors.textSecondary}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  multiline
                  maxLength={300}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  className={`w-full bg-brand rounded-[14px] py-3.5 items-center mt-1 ${
                    reviewRating === 0 ? 'opacity-40' : ''
                  }`}
                  activeOpacity={0.7}
                  onPress={handleSubmitReview}
                  disabled={reviewRating === 0 || submittingReview}
                >
                  {submittingReview ? (
                    <ActivityIndicator color={colors.backgroundDark} />
                  ) : (
                    <Text className="text-bgDark text-base font-bold">Enviar avaliação</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className="py-2"
                  activeOpacity={0.7}
                  onPress={() => { setShowReviewModal(false); navigation.navigate('Tabs'); }}
                >
                  <Text className="text-textSecondary text-sm">Pular</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Star size={48} color={colors.brand} fill={colors.brand} />
                <Text className="text-white text-xl font-bold">Obrigado!</Text>
                <Text className="text-textSecondary text-sm text-center">
                  Sua avaliação ajuda a melhorar o Pronto
                </Text>
                <TouchableOpacity
                  className="w-full bg-brand rounded-[14px] py-3.5 items-center mt-1"
                  activeOpacity={0.7}
                  onPress={() => { setShowReviewModal(false); navigation.navigate('Tabs'); }}
                >
                  <Text className="text-bgDark text-base font-bold">Voltar ao início</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
