import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GlassCard } from "@/components/ui/GlassCard";
import type { ChatMessage } from "@/types";

// ==============================================================================
// ChatBubble — Bolha de Mensagem no Chat do Jacquin Praiano
// Mensagens do usuário são alinhadas à direita (teal acentuado).
// Respostas da IA são alinhadas à esquerda com efeito glass.
// ==============================================================================

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.assistantRow}>
      <GlassCard intensity="light" noAnimation className="px-4 py-3 max-w-[88%]">
        <Text style={styles.assistantText}>
          {message.content}
          {message.is_streaming && (
            <Text style={styles.cursor}> |</Text>
          )}
        </Text>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  userRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  userBubble: {
    backgroundColor: "rgba(45, 212, 191, 0.20)",
    borderColor: "rgba(45, 212, 191, 0.35)",
    borderWidth: 1,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: "80%",
  },
  userText: {
    color: "#ccfbf1",
    fontSize: 14,
    lineHeight: 20,
  },
  assistantRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  assistantText: {
    color: "rgba(255, 255, 255, 0.90)",
    fontSize: 14,
    lineHeight: 21,
  },
  cursor: {
    color: "#2dd4bf",
    fontWeight: "700",
  },
});
