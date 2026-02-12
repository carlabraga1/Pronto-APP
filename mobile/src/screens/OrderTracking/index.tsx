import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../@types/navigation';
import { colors } from '../../constants/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TrackingStatus = 'PROCURANDO' | 'AGUARDANDO' | 'ACEITO' | 'A_CAMINHO' | 'FINALIZADO';

const steps: { status: TrackingStatus; label: string; icon: typeof Search }[] = [
  { status: 'PROCURANDO', label: 'Procurando profissional', icon: Search },
  { status: 'AGUARDANDO', label: 'Aguardando aceitação', icon: Clock },
  { status: 'ACEITO', label: 'Profissional aceitou', icon: ThumbsUp },
  { status: 'A_CAMINHO', label: 'A caminho', icon: Truck },
  { status: 'FINALIZADO', label: 'Finalizado', icon: Flag },
];

const statusColors: Record<TrackingStatus, string> = {
  PROCURANDO: colors.brand,
  AGUARDANDO: colors.brand,
  ACEITO: colors.success,
  A_CAMINHO: colors.info,
  FINALIZADO: colors.success,
};

// Coordenadas mock
const DESTINATION = { latitude: -23.5505, longitude: -46.6333 };
const PRO_START = { latitude: -23.5605, longitude: -46.6433 };
const INITIAL_ETA = 8; // minutos

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d1d1d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d1d1d' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2c2c2c' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#383838' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e1626' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#1a1a1a' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1a1a1a' }],
  },
];

function interpolate(
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number },
  t: number,
) {
  return {
    latitude: start.latitude + (end.latitude - start.latitude) * t,
    longitude: start.longitude + (end.longitude - start.longitude) * t,
  };
}

function generateRoute(
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number },
  pointCount: number,
) {
  const points = [];
  for (let i = 0; i <= pointCount; i++) {
    points.push(interpolate(start, end, i / pointCount));
  }
  return points;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_HEIGHT = SCREEN_HEIGHT * 0.5;
const TOTAL_STEPS = 30;

export default function OrderTrackingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const mapRef = useRef<MapView>(null);
  const [currentStatus, setCurrentStatus] = useState<TrackingStatus>('PROCURANDO');
  const [proPosition, setProPosition] = useState(PRO_START);
  const [eta, setEta] = useState(INITIAL_ETA);
  const [stepIndex, setStepIndex] = useState(0);

  const currentIndex = steps.findIndex((s) => s.status === currentStatus);
  const isFinished = currentStatus === 'FINALIZADO';
  const isEnRoute = currentStatus === 'A_CAMINHO';
  const isAccepted = currentStatus === 'ACEITO';

  const routePoints = generateRoute(PRO_START, DESTINATION, TOTAL_STEPS);

  const advanceStatus = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentStatus(steps[currentIndex + 1].status);
    }
  };

  // Simulação de movimento do profissional
  useEffect(() => {
    if (!isEnRoute) return;

    // Reset ao entrar em A_CAMINHO
    setStepIndex(0);
    setProPosition(PRO_START);
    setEta(INITIAL_ETA);

    const interval = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next >= TOTAL_STEPS) {
          clearInterval(interval);
          // Chegou ao destino -> avança para INICIADO
          setTimeout(() => setCurrentStatus('INICIADO'), 500);
          return prev;
        }

        const newPos = routePoints[next];
        setProPosition(newPos);

        // ETA proporcional
        const remaining = TOTAL_STEPS - next;
        const newEta = Math.max(1, Math.round((remaining / TOTAL_STEPS) * INITIAL_ETA));
        setEta(newEta);

        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isEnRoute]);

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
          onPress: () => {
            Alert.alert('Pedido cancelado', 'Seu pedido foi cancelado.');
            navigation.goBack();
          },
        },
      ],
    );
  };

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
              {isCurrent && (
                <Text style={[styles.timelineStatus, { color: stepColor }]}>
                  Em progresso...
                </Text>
              )}
              {isPast && (
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
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
      >
        {/* Marker do profissional */}
        <Marker
          coordinate={proPosition}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.proMarker}>
            <Navigation size={16} color="#fff" />
          </View>
        </Marker>

        {/* Marker do destino */}
        <Marker coordinate={DESTINATION} anchor={{ x: 0.5, y: 1 }}>
          <View style={styles.destMarkerWrap}>
            <View style={styles.destMarker}>
              <MapPin size={16} color={colors.backgroundDark} />
            </View>
            <View style={styles.destMarkerTail} />
          </View>
        </Marker>

        {/* Rota */}
        <Polyline
          coordinates={routePoints}
          strokeColor={colors.info}
          strokeWidth={4}
          lineDashPattern={[8, 6]}
        />
      </MapView>

      {/* Botão recentralizar */}
      <TouchableOpacity
        style={styles.recenterBtn}
        onPress={recenterMap}
        activeOpacity={0.7}
      >
        <LocateFixed size={20} color={colors.brand} />
      </TouchableOpacity>

      {/* Card do profissional flutuante */}
      <TouchableOpacity
        style={styles.proFloatingCard}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ProfessionalProfile', { professionalId: '1' })}
      >
        <View style={styles.proFloatingRow}>
          <View style={styles.avatar}>
            <UserRound size={24} color={colors.textSecondary} />
          </View>
          <View style={styles.proFloatingInfo}>
            <Text style={styles.proFloatingName}>João Silva</Text>
            <View style={styles.proFloatingMeta}>
              <Star size={12} color={colors.brand} fill={colors.brand} />
              <Text style={styles.proFloatingRating}>4.9</Text>
              <Text style={styles.viewProfileLink}>Ver perfil</Text>
              <View style={styles.etaBadge}>
                <Clock size={12} color={colors.info} />
                <Text style={styles.etaText}>{eta} min</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.phoneBtn}
            activeOpacity={0.7}
            onPress={() => Alert.alert('Ligar', '+55 (11) 98888-7777')}
          >
            <Phone size={18} color={colors.brand} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
                  <Text style={styles.infoValue}>Eletricista</Text>
                </View>
                <View style={[styles.infoItem, styles.infoBorder]}>
                  <Text style={styles.infoLabel}>Endereço</Text>
                  <Text style={styles.infoValue}>Rua das Flores, 123 - São Paulo</Text>
                </View>
                <View style={[styles.infoItem, styles.infoBorder]}>
                  <Text style={styles.infoLabel}>Valor estimado</Text>
                  <Text style={styles.priceValue}>R$ 80,00/h</Text>
                </View>
              </View>
            </View>

            {/* Botão dev para simular avanço */}
            <TouchableOpacity
              style={styles.devBtn}
              activeOpacity={0.7}
              onPress={advanceStatus}
            >
              <ChevronRight size={16} color={colors.brand} />
              <Text style={styles.devBtnText}>Simular próximo status</Text>
            </TouchableOpacity>

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
            onPress={() => navigation.navigate('ProfessionalProfile', { professionalId: '1' })}
          >
            <View style={styles.proRow}>
              <View style={styles.avatar}>
                <UserRound size={28} color={colors.textSecondary} />
              </View>
              <View style={styles.proInfo}>
                <Text style={styles.proName}>João Silva</Text>
                <View style={styles.ratingRow}>
                  <Star size={14} color={colors.brand} fill={colors.brand} />
                  <Text style={styles.ratingText}>4.9</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.phoneBtn}
                activeOpacity={0.7}
                onPress={() => Alert.alert('Ligar', '+55 (11) 98888-7777')}
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
              onPress={() => navigation.navigate('OrderChat', { orderId: 'mock-1' })}
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
                <Text style={styles.infoValue}>Eletricista</Text>
              </View>
              <View style={[styles.infoItem, styles.infoBorder]}>
                <Text style={styles.infoLabel}>Endereço</Text>
                <Text style={styles.infoValue}>Rua das Flores, 123 - São Paulo</Text>
              </View>
              <View style={[styles.infoItem, styles.infoBorder]}>
                <Text style={styles.infoLabel}>Horário</Text>
                <Text style={styles.infoValue}>Agora</Text>
              </View>
              <View style={[styles.infoItem, styles.infoBorder]}>
                <Text style={styles.infoLabel}>Valor estimado</Text>
                <Text style={styles.priceValue}>R$ 80,00/h</Text>
              </View>
            </View>
          </View>

          {/* Botão dev para simular avanço */}
          {!isFinished && (
            <TouchableOpacity
              style={styles.devBtn}
              activeOpacity={0.7}
              onPress={advanceStatus}
            >
              <ChevronRight size={16} color={colors.brand} />
              <Text style={styles.devBtnText}>Simular próximo status</Text>
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
            </View>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      )}
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
  proMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.info,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 6,
    shadowColor: colors.info,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  destMarkerWrap: {
    alignItems: 'center',
  },
  destMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 6,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  destMarkerTail: {
    width: 3,
    height: 10,
    backgroundColor: colors.brand,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  recenterBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  // Floating professional card
  proFloatingCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  proFloatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proFloatingInfo: {
    flex: 1,
    gap: 4,
  },
  proFloatingName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  proFloatingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  proFloatingRating: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: '600',
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 4,
  },
  etaText: {
    color: colors.info,
    fontSize: 12,
    fontWeight: '700',
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

  // Dev button
  devBtn: {
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
  devBtnText: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: '600',
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
});
