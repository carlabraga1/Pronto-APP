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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  UserRound,
  Send,
  Star,
  ChevronRight,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../@types/navigation';
import { colors } from '../../constants/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Message = {
  id: string;
  text: string;
  sender: 'client' | 'professional';
  time: string;
};

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Olá! Aceitei seu pedido de eletricista. Estou verificando os detalhes.',
    sender: 'professional',
    time: '14:30',
  },
  {
    id: '2',
    text: 'Oi João! Ótimo, obrigado por aceitar.',
    sender: 'client',
    time: '14:31',
  },
  {
    id: '3',
    text: 'Vou precisar levar alguma ferramenta específica? Pode me descrever melhor o problema?',
    sender: 'professional',
    time: '14:32',
  },
];

export default function ChatScreen() {
  const navigation = useNavigation<NavigationProp>();
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;

    const newMessage: Message = {
      id: String(Date.now()),
      text,
      sender: 'client',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    // Simula resposta do profissional
    setTimeout(() => {
      const reply: Message = {
        id: String(Date.now() + 1),
        text: 'Entendido! Estou a caminho, chego em breve.',
        sender: 'professional',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, reply]);
    }, 2000);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isClient = item.sender === 'client';

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
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

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
          onPress={() => navigation.navigate('ProfessionalProfile', { professionalId: '1' })}
        >
          <View style={styles.headerAvatar}>
            <UserRound size={20} color={colors.textSecondary} />
          </View>
          <View>
            <Text style={styles.headerName}>João Silva</Text>
            <View style={styles.headerMeta}>
              <Star size={10} color={colors.brand} fill={colors.brand} />
              <Text style={styles.headerRating}>4.9</Text>
              <Text style={styles.headerStatus}>Online</Text>
            </View>
          </View>
          <ChevronRight size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
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
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  flex: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerRating: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: '600',
  },
  headerStatus: {
    color: colors.success,
    fontSize: 11,
    marginLeft: 6,
  },

  // Messages
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  messageBubbleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '85%',
  },
  clientWrapper: {
    alignSelf: 'flex-end',
  },
  proWrapper: {
    alignSelf: 'flex-start',
  },
  bubbleAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '100%',
  },
  clientBubble: {
    backgroundColor: colors.brand,
    borderBottomRightRadius: 4,
  },
  proBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  clientText: {
    color: colors.backgroundDark,
  },
  proText: {
    color: colors.textPrimary,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  clientTime: {
    color: 'rgba(18, 18, 18, 0.5)',
  },
  proTime: {
    color: colors.textSecondary,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
  },
  input: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    maxHeight: 80,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.surface,
  },
});
