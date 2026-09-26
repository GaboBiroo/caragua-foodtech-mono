import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { GlassCard } from "@/components/ui/GlassCard";
import { SPRING_CONFIG } from "@/lib/constants";

// ==============================================================================
// DiscoveryCard — Card Visual Dominante do Feed (Estilo Reels/TikTok)
// Foto do prato ocupa 100% do card, com overlay de gradiente e informações
// no rodapé usando Glass. Combina dados PostGIS (distância) com RAG (insight).
// ==============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = CARD_WIDTH * 1.25;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface DiscoveryCardProps {
  restaurantName: string;
  dishName: string;
  dishDescription: string;
  price: number;
  imageUrl: string;
  distanceText: string;
  neighborhood: string;
  decayedRating: number;
  totalReviews: number;
  aiInsight?: string;
  tags?: string[];
  index: number;
  onPress?: () => void;
}

export function DiscoveryCard({
  restaurantName,
  dishName,
  dishDescription,
  price,
  imageUrl,
  distanceText,
  neighborhood,
  decayedRating,
  totalReviews,
  aiInsight,
  tags = [],
  index,
  onPress,
}: DiscoveryCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.97, SPRING_CONFIG);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, SPRING_CONFIG);
        }}
        style={[styles.cardWrapper, animatedStyle]}
      >
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.image}
          imageStyle={styles.imageInner}
        >
          {/* Gradiente de leitura sobre a imagem */}
          <LinearGradient
            colors={[
              "transparent",
              "rgba(0,0,0,0.15)",
              "rgba(0,0,0,0.75)",
              "rgba(0,0,0,0.92)",
            ]}
            locations={[0, 0.3, 0.7, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Tags geográficas e dietéticas no topo */}
          <View style={styles.topRow}>
            <GlassCard intensity="light" noAnimation className="px-3 py-1.5">
              <Text style={styles.distanceText}>
                📍 {distanceText} — {neighborhood}
              </Text>
            </GlassCard>
            <GlassCard intensity="light" noAnimation className="px-3 py-1.5">
              <Text style={styles.ratingText}>
                ⭐ {decayedRating.toFixed(1)} ({totalReviews})
              </Text>
            </GlassCard>
          </View>

          {/* Informações no rodapé (sobre a imagem) */}
          <View style={styles.bottomContent}>
            {/* Tags dietéticas */}
            {tags.length > 0 && (
              <View style={styles.tagsRow}>
                {tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.dishName} numberOfLines={2}>
              {dishName}
            </Text>
            <Text style={styles.restaurantName}>{restaurantName}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>R$ {price.toFixed(2)}</Text>
              {aiInsight && (
                <View style={styles.aiChip}>
                  <Text style={styles.aiChipText}>🤖 {aiInsight}</Text>
                </View>
              )}
            </View>
          </View>
        </ImageBackground>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
    alignSelf: "center",
    // Sombra
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 15,
  },
  image: {
    flex: 1,
    justifyContent: "space-between",
  },
  imageInner: {
    borderRadius: 24,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
  },
  distanceText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  ratingText: {
    color: "#fbbf24",
    fontSize: 11,
    fontWeight: "700",
  },
  bottomContent: {
    padding: 18,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: "rgba(45, 212, 191, 0.20)",
    borderColor: "rgba(45, 212, 191, 0.40)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: {
    color: "#5eead4",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  dishName: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  restaurantName: {
    color: "rgba(255, 255, 255, 0.65)",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  price: {
    color: "#2dd4bf",
    fontSize: 20,
    fontWeight: "800",
  },
  aiChip: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  aiChipText: {
    color: "rgba(255, 255, 255, 0.70)",
    fontSize: 11,
    fontWeight: "500",
  },
});
