import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
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
      const { data: order } = await api.get(`/requests/${orderId}`);
      setOrderData(order);

      const { data: chat } = await api.get(`/requests/${orderId}/chat`);
      setMessages(chat.messages || []);

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
        className={`flex-row items-end gap-2 max-w-[85%] ${
          isClient ? 'self-end' : 'self-start'
        }`}
      >
        {!isClient && (
          <View className="w-[26px] h-[26px] rounded-full bg-surface items-center justify-center mb-0.5">
            <UserRound size={14} color={colors.textSecondary} />
          </View>
        )}
        <View
          className={`rounded-2xl px-3.5 py-2.5 ${
            isClient ? 'bg-brand rounded-br-[4px]' : 'bg-surface rounded-bl-[4px]'
          }`}
        >
          <Text className={`text-sm leading-5 ${isClient ? 'text-bgDark' : 'text-white'}`}>
            {item.text}
          </Text>
          <Text
            className={`text-[10px] mt-1 self-end ${
              isClient ? 'text-bgDark/50' : 'text-textSecondary'
            }`}
          >
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bgDark" edges={['top']}>
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Chat</Text>
          <View className="w-10 h-10" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

  const proName = orderData?.professional?.name || 'Profissional';
  const proRating = orderData?.professional?.rating?.toFixed(1) || '0.0';
  const proId = orderData?.professional?.id ? String(orderData.professional.id) : '1';

  return (
    <SafeAreaView className="flex-1 bg-bgDark" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center"
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center gap-2.5"
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ProfessionalProfile', { professionalId: proId })}
        >
          <View className="w-[38px] h-[38px] rounded-full bg-surface items-center justify-center">
            <UserRound size={20} color={colors.textSecondary} />
          </View>
          <View>
            <Text className="text-white text-[15px] font-semibold">{proName}</Text>
            <View className="flex-row items-center gap-1">
              <Star size={10} color={colors.brand} fill={colors.brand} />
              <Text className="text-brand text-xs font-semibold">{proRating}</Text>
              <Text className="text-success text-[11px] ml-1.5">Online</Text>
            </View>
          </View>
          <ChevronRight size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        <View className="w-10 h-10" />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          contentContainerClassName="px-4 py-4 gap-2.5"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input bar */}
        <View className="flex-row items-end px-4 py-3 gap-2.5 border-t border-white/[0.06]">
          <View className="flex-1 bg-surface rounded-[20px] px-4 py-2.5 max-h-[120px]">
            <TextInput
              className="text-white text-[15px] leading-5 max-h-20"
              value={inputText}
              onChangeText={setInputText}
              placeholder="Digite sua mensagem..."
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity
            className={`w-11 h-11 rounded-full items-center justify-center ${
              inputText.trim() ? 'bg-brand' : 'bg-surface'
            }`}
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
