import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  UserRound,
  Send,
  Star,
  ChevronRight,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../@types/navigation';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import api, { BASE_URL } from '../../services/api';
import { io, Socket } from 'socket.io-client';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ChatRoute = RouteProp<RootStackParamList, 'OrderChat'>;

type Message = {
  id: number | string;
  text: string;
  senderType: 'CLIENT' | 'PROFESSIONAL';
  createdAt: string;
};

export default function ChatScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ChatRoute>();
  const { orderId } = route.params;
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    loadChat();
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const loadChat = async () => {
    try {
      // Buscar dados do pedido para mostrar o profissional no header
      const { data: order } = await api.get(`/requests/${orderId}`);
      setOrderData(order);

      // Buscar mensagens do chat
      const { data: chat } = await api.get(`/requests/${orderId}/chat`);
      setMessages(chat.messages || []);

      // Conectar Socket.IO
      connectSocket();
    } catch (err) {
      console.log('Erro ao carregar chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const connectSocket = () => {
    const socket = io(`${BASE_URL}/chat`, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit('join_request_chat', { orderId: Number(orderId) });
    });

    socket.on('new_message', (message: Message) => {
      setMessages((prev) => {
        // Evitar duplicatas
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    socketRef.current = socket;
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      orderId: Number(orderId),
      text,
      senderType: 'CLIENT',
      senderId: user?.id,
    });

    setInputText('');
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isClient = item.senderType === 'CLIENT';

    return (
      <View
        style={[
          styles.messageBubbleWrapper,
          isClient ? styles.clientWrapper : styles.proWrapper,
        ]}
      >
        {!isClient && (
          <View style={styles.bubbleAvatar}>
            <UserRound size={14} color={colors.textSecondary} />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isClient ? styles.clientBubble : styles.proBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isClient ? styles.clientText : styles.proText,
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isClient ? styles.clientTime : styles.proTime,
            ]}
          >
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

  const proName = orderData?.professional?.name || 'Profissional';
  const proRating = orderData?.professional?.rating?.toFixed(1) || '0.0';
  const proId = orderData?.professional?.id ? String(orderData.professional.id) : '1';

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
        <TouchableOpacity
          style={styles.headerCenter}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ProfessionalProfile', { professionalId: proId })}
        >
          <View style={styles.headerAvatar}>
            <UserRound size={20} color={colors.textSecondary} />
          </View>
          <View>
            <Text style={styles.headerName}>{proName}</Text>
            <View style={styles.headerMeta}>
              <Star size={10} color={colors.brand} fill={colors.brand} />
              <Text style={styles.headerRating}>{proRating}</Text>
              <Text style={styles.headerStatus}>Online</Text>
            </View>
          </View>
          <ChevronRight size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Digite sua mensagem..."
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            activeOpacity={0.7}
            disabled={!inputText.trim()}
          >
            <Send size={20} color={inputText.trim() ? colors.backgroundDark : colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundDark },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerName: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  headerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerRating: { color: colors.brand, fontSize: 12, fontWeight: '600' },
  headerStatus: { color: colors.success, fontSize: 11, marginLeft: 6 },
  messagesList: { paddingHorizontal: 16, paddingVertical: 16, gap: 10 },
  messageBubbleWrapper: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '85%' },
  clientWrapper: { alignSelf: 'flex-end' },
  proWrapper: { alignSelf: 'flex-start' },
  bubbleAvatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  messageBubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '100%' },
  clientBubble: { backgroundColor: colors.brand, borderBottomRightRadius: 4 },
  proBubble: { backgroundColor: colors.surface, borderBottomLeftRadius: 4 },
  messageText: { fontSize: 14, lineHeight: 20 },
  clientText: { color: colors.backgroundDark },
  proText: { color: colors.textPrimary },
  messageTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  clientTime: { color: 'rgba(18, 18, 18, 0.5)' },
  proTime: { color: colors.textSecondary },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 12, gap: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  inputWrapper: { flex: 1, backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 120 },
  input: { color: colors.textPrimary, fontSize: 15, lineHeight: 20, maxHeight: 80 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: colors.surface },
});
