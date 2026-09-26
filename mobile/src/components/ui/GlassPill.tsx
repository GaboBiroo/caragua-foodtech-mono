import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { SPRING_CONFIG } from "@/lib/constants";

// ==============================================================================
// GlassPill — Pílula de Filtro com Glassmorphism e Feedback Tátil
// Usada no header do Discovery Feed (Todos, Frutos do Mar, Vegano, etc.)
// ==============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlassPillProps {
  label: string;
  emoji: string;
  isActive: boolean;
  onPress: () => void;
}

export function GlassPill({ label, emoji, isActive, onPress }: GlassPillProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, SPRING_CONFIG);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIG);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle]}
    >
      <BlurView
        intensity={isActive ? 50 : 25}
        tint="dark"
        style={[
          styles.pill,
          {
            borderColor: isActive
              ? "rgba(45, 212, 191, 0.50)"
              : "rgba(255, 255, 255, 0.12)",
            backgroundColor: isActive
              ? "rgba(45, 212, 191, 0.15)"
              : "rgba(255, 255, 255, 0.06)",
          },
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text
          style={[
            styles.label,
            {
              color: isActive ? "#2dd4bf" : "rgba(255,255,255,0.75)",
              fontWeight: isActive ? "700" : "500",
            },
          ]}
        >
          {label}
        </Text>
      </BlurView>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
    marginRight: 8,
  },
  emoji: { fontSize: 16 },
  label: { fontSize: 13, letterSpacing: 0.2 },
});
