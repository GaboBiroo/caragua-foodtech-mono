import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/useAppStore';
import { useAIStream } from '@/hooks/useAIStream';
import { StreamingMessage } from '@/components/ai/StreamingMessage';
import type { ChatMessage } from '@/types';

// ==============================================================================
// Screen 2: Chat com Jacquin Praiano (formSheet Modal)
// Implementação formal com base nas Páginas 1, 2, 7, 8 e 10 do Documento:
// - Persona litorânea caiçara ("Da hora", "Show de bola", focado e polido)
// - Streaming SSE iterativo sem travamento de RAM
// - Injeção de GlassCards para recomendações de restaurantes
// ==============================================================================

const QUICK_PROMPTS = [
  '🐟 Onde comer no Festival da Tainha?',
  '🦐 Casquinha de siri boa no Martim de Sá',
  '🌱 Moqueca vegana sem glúten no Centro',
  '🏆 Circuito Caraguá A Gosto',
];

export default function ChatScreen() {
  const router = useRouter();
  const { chatMessages, addMessage, clearChat } = useAppStore();
  const { startStream, isStreaming, stopStream } = useAIStream();

  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isStreaming) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setInput('');

    // Adiciona a mensagem do usuário
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };
    addMessage(userMsg);

    // Cria a mensagem placeholder do assistente
    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      is_streaming: true,
    };
    addMessage(assistantMsg);

    // Dispara o fluxo SSE do RAG
    await startStream(query);
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [chatMessages]);

  return (
    <View style={styles.container}>
      <BlurView intensity={Platform.OS === 'ios' ? 80 : 95} tint="dark" style={styles.blurContainer}>
        {/* Barra Superior / Header do Sheet */}
        <View style={styles.header}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarBorder}>
              <Image
                source={require('@/assets/images/jacquin-praiano.png')}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
            <View>
              <Text style={styles.chefName}>Jacquin Praiano 👨‍🍳</Text>
              <Text style={styles.chefStatus}>
                {isStreaming ? '⚡ Consultando pgvector HNSW...' : 'Guia Gastronômico de Caraguatatuba'}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => {
              stopStream();
              router.back();
            }}
            style={styles.closeBtn}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>

        {/* Lista de Mensagens */}
        <FlatList
          ref={flatListRef}
          data={chatMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StreamingMessage
              content={item.content}
              role={item.role}
              isStreaming={item.is_streaming}
            />
          )}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.welcomeEmoji}>🌊</Text>
              <Text style={styles.welcomeTitle}>Fala, meu parceiro!</Text>
              <Text style={styles.welcomeSubtitle}>
                Eu sou o Jacquin Praiano! Me diz o que você tá com vontade de comer
                ou em qual praia você tá que eu busco as melhores opções de Caraguá!
              </Text>

              {/* Sugestões Rápidas */}
              <View style={styles.quickPromptsContainer}>
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => handleSend(prompt)}
                    style={styles.quickPromptBtn}
                  >
                    <Text style={styles.quickPromptText}>{prompt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          }
        />

        {/* Barra de Input Inferior */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: Quero comer peixe frito barato perto da praia..."
              placeholderTextColor="rgba(255, 255, 255, 0.40)"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={400}
              returnKeyType="send"
              onSubmitEditing={() => handleSend()}
            />

            <Pressable
              onPress={() => handleSend()}
              disabled={isStreaming || !input.trim()}
              style={[
                styles.sendBtn,
                (!input.trim() || isStreaming) && styles.sendBtnDisabled,
              ]}
            >
              <Text style={styles.sendIcon}>↑</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  blurContainer: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBorder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#2dd4bf',
    overflow: 'hidden',
    backgroundColor: '#0d9488',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  chefName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  chefStatus: {
    color: '#2dd4bf',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: 'rgba(255, 255, 255, 0.70)',
    fontSize: 14,
    fontWeight: '700',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 36,
    paddingHorizontal: 20,
  },
  welcomeEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  welcomeTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  quickPromptsContainer: {
    width: '100%',
    gap: 8,
  },
  quickPromptBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(45, 212, 191, 0.25)',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quickPromptText: {
    color: '#ccfbf1',
    fontSize: 13,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(2, 6, 23, 0.50)',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    color: '#ffffff',
    fontSize: 14,
    maxHeight: 110,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.35,
  },
  sendIcon: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
});
