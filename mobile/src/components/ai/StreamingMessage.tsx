import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassCard } from '@/components/ui/GlassCard';

// ==============================================================================
// StreamingMessage — Renderizador de Server-Sent Events e RAG Estruturado
// Reconhece dinamicamente blocos de texto e metadados RAG enviados na stream,
// injetando GlassCards nativos diretamente na árvore de componentes (Component Tree).
// ==============================================================================

export interface StructuredRestaurantSuggestion {
  id?: string;
  name: string;
  neighborhood: string;
  distanceMeters?: number;
  decayedRating?: number;
  highlightDish?: string;
  price?: number;
}

export interface StreamingMessageProps {
  content: string;
  role: 'user' | 'assistant';
  isStreaming?: boolean;
}

export const StreamingMessage: React.FC<StreamingMessageProps> = ({
  content,
  role,
  isStreaming = false,
}) => {
  const router = useRouter();
  const isUser = role === 'user';

  if (isUser) {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{content}</Text>
        </View>
      </View>
    );
  }

  // Parser de blocos estruturados da LLM
  // Detecta se a LLM emitiu um bloco estruturado no formato:
  // ```json:restaurant { ... } ``` ou tags <restaurant> ... </restaurant>
  const parsedSections = parseStreamContent(content);

  return (
    <View style={styles.assistantRow}>
      <View style={styles.assistantContainer}>
        {parsedSections.map((section, idx) => {
          if (section.type === 'text') {
            return (
              <GlassCard
                key={`txt-${idx}`}
                intensity={40}
                className="px-4 py-3 mb-2"
              >
                <Text style={styles.assistantText}>
                  {section.text}
                  {isStreaming && idx === parsedSections.length - 1 && (
                    <Text style={styles.cursor}> ❚</Text>
                  )}
                </Text>
              </GlassCard>
            );
          }

          if (section.type === 'restaurant' && section.restaurant) {
            const r = section.restaurant;
            return (
              <GlassCard
                key={`rest-${idx}`}
                intensity={60}
                className="p-4 mb-3 border-teal-500/40"
              >
                <View style={styles.cardHeader}>
                  <View style={styles.badgeLoc}>
                    <Text style={styles.badgeLocText}>📍 {r.neighborhood}</Text>
                  </View>
                  {r.decayedRating && (
                    <Text style={styles.ratingText}>
                      ⭐ {r.decayedRating.toFixed(1)}
                    </Text>
                  )}
                </View>

                <Text style={styles.restaurantTitle}>{r.name}</Text>

                {r.highlightDish && (
                  <View style={styles.dishBox}>
                    <Text style={styles.dishLabel}>Recomendação do Jacquin:</Text>
                    <Text style={styles.dishName}>{r.highlightDish}</Text>
                    {r.price && (
                      <Text style={styles.dishPrice}>R$ {r.price.toFixed(2)}</Text>
                    )}
                  </View>
                )}

                {r.id && (
                  <Pressable
                    onPress={() => router.push(`/restaurant/${r.id}`)}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionBtnText}>Ver Perfil & Cardápio →</Text>
                  </Pressable>
                )}
              </GlassCard>
            );
          }

          return null;
        })}
      </View>
    </View>
  );
};

interface ParsedSection {
  type: 'text' | 'restaurant';
  text?: string;
  restaurant?: StructuredRestaurantSuggestion;
}

function parseStreamContent(raw: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  
  // Regex para capturar tags <restaurant> ... </restaurant> ou blocos JSON
  const tagRegex = /<restaurant>([\s\S]*?)<\/restaurant>/g;
  let lastIndex = 0;
  let match;

  while ((match = tagRegex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      const textPart = raw.slice(lastIndex, match.index).trim();
      if (textPart) {
        sections.push({ type: 'text', text: textPart });
      }
    }

    try {
      const jsonContent = JSON.parse(match[1].trim());
      sections.push({
        type: 'restaurant',
        restaurant: {
          id: jsonContent.id,
          name: jsonContent.name,
          neighborhood: jsonContent.neighborhood,
          distanceMeters: jsonContent.distanceMeters,
          decayedRating: jsonContent.decayedRating,
          highlightDish: jsonContent.highlightDish,
          price: jsonContent.price,
        },
      });
    } catch {
      // Se não for JSON estrito, repassa como texto
      sections.push({ type: 'text', text: match[1].trim() });
    }

    lastIndex = tagRegex.lastIndex;
  }

  if (lastIndex < raw.length) {
    const remaining = raw.slice(lastIndex);
    const openTagIdx = remaining.indexOf('<restaurant>');
    if (openTagIdx !== -1) {
      const beforeTag = remaining.slice(0, openTagIdx).trim();
      if (beforeTag) {
        sections.push({ type: 'text', text: beforeTag });
      }
    } else {
      const remainingText = remaining.trim();
      if (remainingText) {
        sections.push({ type: 'text', text: remainingText });
      }
    }
  }

  if (sections.length === 0 && raw) {
    const openTagIdx = raw.indexOf('<restaurant>');
    if (openTagIdx !== -1) {
      const beforeTag = raw.slice(0, openTagIdx).trim();
      if (beforeTag) {
        sections.push({ type: 'text', text: beforeTag });
      }
    } else {
      sections.push({ type: 'text', text: raw });
    }
  }

  return sections;
}

const styles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  userBubble: {
    backgroundColor: 'rgba(13, 148, 136, 0.35)',
    borderColor: 'rgba(45, 212, 191, 0.40)',
    borderWidth: 1,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '82%',
  },
  userText: {
    color: '#f0fdfa',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  assistantRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  assistantContainer: {
    maxWidth: '92%',
    width: '92%',
  },
  assistantText: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 14,
    lineHeight: 22,
  },
  cursor: {
    color: '#2dd4bf',
    fontWeight: '800',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeLoc: {
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeLocText: {
    color: '#2dd4bf',
    fontSize: 11,
    fontWeight: '700',
  },
  ratingText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '800',
  },
  restaurantTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  dishBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 10,
    marginVertical: 6,
  },
  dishLabel: {
    color: 'rgba(255, 255, 255, 0.50)',
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dishName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  dishPrice: {
    color: '#2dd4bf',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  actionBtn: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(13, 148, 136, 0.30)',
    borderColor: 'rgba(45, 212, 191, 0.50)',
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#5eead4',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default StreamingMessage;
