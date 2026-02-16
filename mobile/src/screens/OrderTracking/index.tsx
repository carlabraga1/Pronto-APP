import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import api from '../../services/api';

let MapView: any = View;
let Marker: any = View;
let Polyline: any = View;
if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Polyline = maps.Polyline;
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

// Coordenadas mock — Manaus
const DESTINATION = { latitude: -3.1100502, longitude: -60.0244787 }; // Soft Live, R. João Alfredo, 625 - São Geraldo
const PRO_START = { latitude: -3.1200, longitude: -60.0350 };         // Profissional a caminho
const INITIAL_ETA = 8; // minutos

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

// Busca rota real pelas ruas via OSRM (gratuito, sem API key)
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
  // Fallback: linha reta
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

  // Buscar rota real ao montar
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

  // Simulação de movimento do profissional seguindo ruas
  useEffect(() => {
    if (!isEnRoute || routePoints.length === 0) return;

    // Amostragem: pegar ~30 pontos igualmente espaçados da rota
    const totalRoutePoints = routePoints.length;
    const sampleCount = Math.min(30, totalRoutePoints);
    const sampledPoints: { latitude: number; longitude: number }[] = [];
    for (let i = 0; i < sampleCount; i++) {
      const idx = Math.round((i / (sampleCount - 1)) * (totalRoutePoints - 1));
      sampledPoints.push(routePoints[idx]);
    }

    // Reset ao entrar em A_CAMINHO
    setStepIndex(0);
    setProPosition(sampledPoints[0]);
    setEta(INITIAL_ETA);

    const interval = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next >= sampledPoints.length) {
          clearInterval(interval);
          // Chegou ao destino -> avança para INICIADO no backend
          setTimeout(async () => {
            try {
              await api.patch(`/requests/${orderId}/status`, { status: 'INICIADO' });
            } catch {}
            setCurrentStatus('INICIADO');
          }, 500);
          return prev;
        }

        setProPosition(sampledPoints[next]);

        // ETA proporcional
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

  // Fit map quando entra em A_CAMINHO
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
    <View style={styles.timeline}>
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;
        const stepColor = isPast || isCurrent ? statusColors[step.status] : colors.textSecondary;
        const isLast = index === steps.length - 1;

        return (
          <View key={step.status} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View
                style={[
                  styles.timelineCircle,
                  {
                    backgroundColor: isPast || isCurrent ? stepColor : 'transparent',
                    borderColor: isFuture ? colors.textSecondary : stepColor,
                  },
                ]}
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
                  style={[
                    styles.timelineLine,
                    { backgroundColor: isPast ? stepColor : 'rgba(255,255,255,0.1)' },
                  ]}
                />
              )}
            </View>

            <View style={styles.timelineContent}>
              <Text
                style={[
                  styles.timelineLabel,
                  isCurrent && { color: colors.textPrimary, fontWeight: '700' },
                  isFuture && { color: colors.textSecondary },
                  isPast && { color: colors.textSecondary },
                ]}
              >
                {step.label}
              </Text>
              {isCurrent && step.status !== 'FINALIZADO' && (
                <Text style={[styles.timelineStatus, { color: stepColor }]}>
                  Em progresso...
                </Text>
              )}
              {(isPast || (isCurrent && step.status === 'FINALIZADO')) && (
                <Text style={styles.timelineDone}>Concluído</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderMap = () => (
    <View style={styles.mapWrapper}>
      <MapView
        ref={mapRef}
        style={styles.map}
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
        {/* Sombra da rota */}
        {routePoints.length > 0 && (
          <Polyline
            coordinates={routePoints}
            strokeColor="rgba(0,0,0,0.4)"
            strokeWidth={8}
          />
        )}
        {/* Rota principal */}
        {routePoints.length > 0 && (
          <Polyline
            coordinates={routePoints}
            strokeColor={colors.brand}
            strokeWidth={5}
          />
        )}

        {/* Marker do destino */}
        <Marker coordinate={DESTINATION} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.destMarkerOuter}>
            <View style={styles.destMarkerInner} />
          </View>
        </Marker>

        {/* Marker do profissional */}
        <Marker
          coordinate={proPosition}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.proMarkerOuter}>
            <View style={styles.proMarker}>
              <Navigation size={14} color="#000" />
            </View>
          </View>
        </Marker>
      </MapView>

      {/* Gradiente superior */}
      <View style={styles.mapGradientTop} />

      {/* ETA badge flutuante */}
      <View style={styles.etaFloating}>
        <Text style={styles.etaFloatingNumber}>{eta}</Text>
        <Text style={styles.etaFloatingLabel}>min</Text>
      </View>

      {/* Botão recentralizar */}
      <TouchableOpacity
        style={styles.recenterBtn}
        onPress={recenterMap}
        activeOpacity={0.7}
      >
        <LocateFixed size={18} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Card do profissional flutuante */}
      <View style={styles.proFloatingCard}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ProfessionalProfile', { professionalId: proId })}
          style={styles.proFloatingRow}
        >
          <View style={styles.proAvatar}>
            <UserRound size={22} color="#fff" />
          </View>
          <View style={styles.proFloatingInfo}>
            <Text style={styles.proFloatingName} numberOfLines={1}>{proName}</Text>
            <View style={styles.proFloatingMeta}>
              <Star size={11} color={colors.brand} fill={colors.brand} />
              <Text style={styles.proFloatingRating}>{proRating}</Text>
              <View style={styles.proFloatingDot} />
              <Text style={styles.proFloatingService}>{serviceName}</Text>
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.proFloatingActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() => Alert.alert('Ligar', proPhone || 'Sem telefone')}
          >
            <Phone size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acompanhar Profissional</Text>
        <View style={styles.backBtn} />
      </View>

      {isEnRoute ? (
        <>
          {renderMap()}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentCompact}
          >
            {/* Timeline compacta */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status do pedido</Text>
              {renderTimeline()}
            </View>

            {/* Info do serviço */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informações</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Serviço</Text>
                  <Text style={styles.infoValue}>{serviceName}</Text>
                </View>
                <View style={[styles.infoItem, styles.infoBorder]}>
                  <Text style={styles.infoLabel}>Endereço</Text>
                  <Text style={styles.infoValue}>{orderAddress}</Text>
                </View>
                <View style={[styles.infoItem, styles.infoBorder]}>
                  <Text style={styles.infoLabel}>Valor estimado</Text>
                  <Text style={styles.priceValue}>
                  {orderData?.price ? `R$ ${orderData.price.toFixed(2).replace('.', ',')}` : 'A combinar'}
                </Text>
                </View>
              </View>
            </View>

            {/* Simular próximo status */}
            {!isFinished && (
              <TouchableOpacity
                style={styles.simulateBtn}
                activeOpacity={0.7}
                onPress={advanceStatus}
              >
                <ChevronRight size={16} color={colors.brand} />
                <Text style={styles.simulateBtnText}>Simular próximo status</Text>
              </TouchableOpacity>
            )}

            {/* Cancelar */}
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.7}
              onPress={handleCancel}
            >
              <XCircle size={18} color={colors.danger} />
              <Text style={styles.cancelText}>Cancelar pedido</Text>
            </TouchableOpacity>

            <View style={{ height: 30 }} />
          </ScrollView>
        </>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Profissional */}
          <TouchableOpacity
            style={styles.professionalCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ProfessionalProfile', { professionalId: proId })}
          >
            <View style={styles.proRow}>
              <View style={styles.avatar}>
                <UserRound size={28} color={colors.textSecondary} />
              </View>
              <View style={styles.proInfo}>
                <Text style={styles.proName}>{proName}</Text>
                <View style={styles.ratingRow}>
                  <Star size={14} color={colors.brand} fill={colors.brand} />
                  <Text style={styles.ratingText}>{proRating}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.phoneBtn}
                activeOpacity={0.7}
                onPress={() => Alert.alert('Ligar', proPhone || 'Sem telefone')}
              >
                <Phone size={18} color={colors.brand} />
              </TouchableOpacity>
            </View>
            <View style={styles.viewProfileRow}>
              <Text style={styles.viewProfileText}>Ver perfil completo</Text>
              <ChevronRight size={14} color={colors.brand} />
            </View>
          </TouchableOpacity>

          {/* Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status do pedido</Text>
            {renderTimeline()}
          </View>

          {/* Botão Chat - aparece apenas no status ACEITO */}
          {isAccepted && (
            <TouchableOpacity
              style={styles.chatBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('OrderChat', { orderId: String(orderId) })}
            >
              <MessageCircle size={20} color={colors.backgroundDark} />
              <Text style={styles.chatBtnText}>Abrir Chat</Text>
            </TouchableOpacity>
          )}

          {/* Info do serviço */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Serviço</Text>
                <Text style={styles.infoValue}>{serviceName}</Text>
              </View>
              <View style={[styles.infoItem, styles.infoBorder]}>
                <Text style={styles.infoLabel}>Endereço</Text>
                <Text style={styles.infoValue}>{orderAddress}</Text>
              </View>
              <View style={[styles.infoItem, styles.infoBorder]}>
                <Text style={styles.infoLabel}>Horário</Text>
                <Text style={styles.infoValue}>Agora</Text>
              </View>
              <View style={[styles.infoItem, styles.infoBorder]}>
                <Text style={styles.infoLabel}>Valor estimado</Text>
                <Text style={styles.priceValue}>
                  {orderData?.price ? `R$ ${orderData.price.toFixed(2).replace('.', ',')}` : 'A combinar'}
                </Text>
              </View>
            </View>
          </View>

          {/* Simular próximo status */}
          {!isFinished && (
            <TouchableOpacity
              style={styles.simulateBtn}
              activeOpacity={0.7}
              onPress={advanceStatus}
            >
              <ChevronRight size={16} color={colors.brand} />
              <Text style={styles.simulateBtnText}>Simular próximo status</Text>
            </TouchableOpacity>
          )}

          {/* Cancelar */}
          {!isFinished && (
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.7}
              onPress={handleCancel}
            >
              <XCircle size={18} color={colors.danger} />
              <Text style={styles.cancelText}>Cancelar pedido</Text>
            </TouchableOpacity>
          )}

          {isFinished && (
            <View style={styles.finishedCard}>
              <Flag size={24} color={colors.success} />
              <Text style={styles.finishedText}>Serviço finalizado!</Text>
              <Text style={styles.finishedSub}>Obrigado por usar o Pronto</Text>
              {!reviewSent && (
                <TouchableOpacity
                  style={styles.reviewOpenBtn}
                  activeOpacity={0.7}
                  onPress={() => setShowReviewModal(true)}
                >
                  <Star size={18} color={colors.backgroundDark} />
                  <Text style={styles.reviewOpenBtnText}>Avaliar profissional</Text>
                </TouchableOpacity>
              )}
              {reviewSent && (
                <Text style={styles.reviewSentText}>Avaliação enviada!</Text>
              )}
            </View>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      )}

      {/* Modal de avaliação */}
      <Modal
        visible={showReviewModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {!reviewSent ? (
              <>
                <Text style={styles.modalTitle}>Avalie o profissional</Text>
                <Text style={styles.modalSubtitle}>{proName}</Text>

                <View style={styles.starsRow}>
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
                  style={styles.modalInput}
                  placeholder="Deixe um comentário (opcional)"
                  placeholderTextColor={colors.textSecondary}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  multiline
                  maxLength={300}
                />

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, reviewRating === 0 && styles.modalSubmitBtnDisabled]}
                  activeOpacity={0.7}
                  onPress={handleSubmitReview}
                  disabled={reviewRating === 0 || submittingReview}
                >
                  {submittingReview ? (
                    <ActivityIndicator color={colors.backgroundDark} />
                  ) : (
                    <Text style={styles.modalSubmitText}>Enviar avaliação</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSkipBtn}
                  activeOpacity={0.7}
                  onPress={() => { setShowReviewModal(false); navigation.navigate('Tabs'); }}
                >
                  <Text style={styles.modalSkipText}>Pular</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Star size={48} color={colors.brand} fill={colors.brand} />
                <Text style={styles.modalTitle}>Obrigado!</Text>
                <Text style={styles.modalSubtitle}>Sua avaliação ajuda a melhorar o Pronto</Text>
                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  activeOpacity={0.7}
                  onPress={() => { setShowReviewModal(false); navigation.navigate('Tabs'); }}
                >
                  <Text style={styles.modalSubmitText}>Voltar ao início</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  },
  contentCompact: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Map
  mapWrapper: {
    height: MAP_HEIGHT,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
  },
  proMarkerOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,193,7,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  destMarkerOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(226, 25, 25, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
    elevation: 4,
  },
  etaFloating: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  etaFloatingNumber: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  etaFloatingLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  recenterBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },

  // Floating professional card
  proFloatingCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  proFloatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proFloatingInfo: {
    flex: 1,
    gap: 3,
  },
  proFloatingName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  proFloatingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  proFloatingRating: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: '700',
  },
  proFloatingDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textSecondary,
  },
  proFloatingService: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  proFloatingActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingVertical: 12,
  },

  // Profissional card (non-map layout)
  professionalCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  proRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proInfo: {
    flex: 1,
    gap: 4,
  },
  proName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '600',
  },
  viewProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
    marginTop: 12,
  },
  viewProfileText: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: '600',
  },
  viewProfileLink: {
    color: colors.brand,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
  phoneBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  // Timeline
  timeline: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 32,
  },
  timelineCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
    gap: 2,
  },
  timelineLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  timelineStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  timelineDone: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  // Info
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
  },
  infoItem: {
    paddingVertical: 10,
  },
  infoBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  priceValue: {
    color: colors.brand,
    fontSize: 16,
    fontWeight: '700',
  },

  // Chat button
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 20,
  },
  chatBtnText: {
    color: colors.backgroundDark,
    fontSize: 16,
    fontWeight: '700',
  },

  // Simulate button
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 12,
    borderStyle: 'dashed',
  },
  simulateBtnText: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: '600',
  },

  // Cancel
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  cancelText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },

  // Finished
  finishedCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  finishedText: {
    color: colors.success,
    fontSize: 18,
    fontWeight: '700',
  },
  finishedSub: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  reviewOpenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brand,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  reviewOpenBtnText: {
    color: colors.backgroundDark,
    fontSize: 15,
    fontWeight: '700',
  },
  reviewSentText: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },

  // Modal de avaliação
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  modalInput: {
    width: '100%',
    backgroundColor: colors.backgroundDark,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalSubmitBtn: {
    width: '100%',
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  modalSubmitBtnDisabled: {
    opacity: 0.4,
  },
  modalSubmitText: {
    color: colors.backgroundDark,
    fontSize: 16,
    fontWeight: '700',
  },
  modalSkipBtn: {
    paddingVertical: 8,
  },
  modalSkipText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
