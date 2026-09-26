import React, { useCallback, useRef, useState } from "react";
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
} from "react-native";
import { BlurView } from "expo-blur";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useAppStore } from "@/store/useAppStore";
import { streamRAGResponse } from "@/lib/api";
import { ChatBubble } from "./ChatBubble";
import type { ChatMessage } from "@/types";

// ==============================================================================
// AIBottomSheet — Interface de Chat Imersiva com o Jacquin Praiano
//
// Comportamento:
// 1. Desliza de baixo para cima com animação spring (Reanimated).
// 2. Background com BlurView pesado (Liquid Glass opaco).
// 3. Mensagens do usuário disparam streaming SSE do RAG de 5 estágios.
// 4. Tokens da LLM são acumulados em tempo real com efeito de digitação.
// 5. Personalidade: descontraída, caiçara, sem muralhas de texto.
// ==============================================================================

const JACQUIN_IMAGE = require("@/assets/images/jacquin-praiano.png");

export function AIBottomSheet() {
  const {
    isChatOpen,
    setChatOpen,
    chatMessages,
    addMessage,
    updateLastAssistantMessage,
    setAIStreaming,
    isAIStreaming,
    location,
    isCeliac,
    isVegan,
    bannedAllergens,
  } = useAppStore();

  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const handleSend = useCallback(async () => {
    const query = inputText.trim();
    if (!query || isAIStreaming) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputText("");

    // Adiciona a mensagem do usuário
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date(),
    };
    addMessage(userMsg);

    // Cria a mensagem placeholder da IA
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      is_streaming: true,
    };
    addMessage(aiMsg);
    setAIStreaming(true);

    let accumulated = "";

    await streamRAGResponse(
      {
        query,
        latitude: location.latitude,
        longitude: location.longitude,
        is_celiac: isCeliac,
        is_vegan: isVegan,
        banned_allergens: bannedAllergens,
      },
      (token) => {
        accumulated += token;
        updateLastAssistantMessage(accumulated);
      },
      () => {
        setAIStreaming(false);
      },
      (error) => {
        updateLastAssistantMessage(
          accumulated +
            "\n\nOpa, deu uma marolinha na conexão! Tenta de novo, parceiro. 🌊"
        );
        setAIStreaming(false);
      }
    );
  }, [inputText, isAIStreaming, location, isCeliac, isVegan, bannedAllergens]);

  if (!isChatOpen) return null;

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(18).stiffness(140)}
      style={styles.overlay}
    >
      <BlurView intensity={80} tint="dark" style={styles.sheet}>
        {/* Borda superior de vidro */}
        <View style={styles.topEdge} />

        {/* Handle de arraste */}
        <Pressable onPress={() => setChatOpen(false)} style={styles.handleArea}>
          <View style={styles.handle} />
        </Pressable>

        {/* Header do Chat */}
        <View style={styles.header}>
          <Image source={JACQUIN_IMAGE} style={styles.headerAvatar} />
          <View>
            <Text style={styles.headerTitle}>Jacquin Praiano</Text>
            <Text style={styles.headerSubtitle}>
              {isAIStreaming ? "Preparando uma recomendação..." : "Seu guia gastronômico caiçara"}
            </Text>
          </View>
        </View>

        {/* Lista de Mensagens */}
        <FlatList
          ref={flatListRef}
          data={chatMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🦐</Text>
              <Text style={styles.emptyTitle}>E aí, parceiro!</Text>
              <Text style={styles.emptyText}>
                Me diz o que você tá afim de comer e o quanto quer gastar que eu
                encontro o melhor de Caraguá pra você!
              </Text>
            </View>
          }
        />

        {/* Barra de Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.inputBar}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ex: Quero frutos do mar perto de Martin de Sá..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              style={styles.input}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <Pressable
              onPress={handleSend}
              disabled={isAIStreaming || !inputText.trim()}
              style={[
                styles.sendButton,
                {
                  opacity: isAIStreaming || !inputText.trim() ? 0.4 : 1,
                },
              ]}
            >
              <Text style={styles.sendText}>↑</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 998,
    justifyContent: "flex-end",
  },
  sheet: {
    height: "80%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderBottomWidth: 0,
    overflow: "hidden",
  },
  topEdge: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  handleArea: {
    alignItems: "center",
    paddingVertical: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.30)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(45, 212, 191, 0.50)",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    marginTop: 1,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    lineHeight: 21,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#ffffff",
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0d9488",
    justifyContent: "center",
    alignItems: "center",
  },
  sendText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
});
