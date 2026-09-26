import React from "react";
import { Image, StyleSheet, Pressable, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  interpolate,
  cancelAnimation,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useAppStore } from "@/store/useAppStore";
import { SPRING_BOUNCY } from "@/lib/constants";

// ==============================================================================
// JacquinFAB — Floating Action Button do Mascote "Jacquin Praiano"
//
// Comportamento:
// 1. IDLE: Flutuação suave com animação "breathing" (escala 1.0 → 1.06)
// 2. STREAMING: Pulse rápido + brilho teal quando a LLM está processando
// 3. PRESS: Spring bouncy para feedback tátil + haptics
// 4. TAP: Abre o BottomSheet de Chat com IA
//
// O mascote nunca é estático. Ele respira, reage e convida à interação.
// ==============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const JACQUIN_IMAGE = require("@/assets/images/jacquin-praiano.png");

export function JacquinFAB() {
  const { isChatOpen, setChatOpen, isAIStreaming } = useAppStore();

  // --- Animação de Respiração (Breathing) ---
  const breathe = useSharedValue(0);
  // --- Animação de Escala ao Pressionar ---
  const pressScale = useSharedValue(1);
  // --- Animação de Glow (brilho teal durante streaming) ---
  const glow = useSharedValue(0);

  React.useEffect(() => {
    // Loop infinito de respiração: escala sutilmente entre 1.0 e 1.06
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  // Quando a LLM está em streaming, pulse mais rápido + glow
  React.useEffect(() => {
    if (isAIStreaming) {
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(glow);
      glow.value = withTiming(0, { duration: 300 });
    }
  }, [isAIStreaming]);

  const fabStyle = useAnimatedStyle(() => {
    const baseScale = interpolate(breathe.value, [0, 1], [1, 1.06]);
    return {
      transform: [
        { scale: baseScale * pressScale.value },
        {
          translateY: interpolate(breathe.value, [0, 1], [0, -4]),
        },
      ],
    };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0, 1], [0, 0.6]),
    transform: [
      { scale: interpolate(glow.value, [0, 1], [1, 1.5]) },
    ],
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.88, SPRING_BOUNCY);
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, SPRING_BOUNCY);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setChatOpen(!isChatOpen);
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.fab, fabStyle]}
    >
      {/* Anel de glow teal durante streaming da IA */}
      <Animated.View style={[styles.glowRing, glowStyle]} />

      {/* Container principal do avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={JACQUIN_IMAGE}
          style={styles.avatar}
          resizeMode="cover"
        />
      </View>

      {/* Indicador de notificação (ponto verde pulsante) */}
      {isAIStreaming && (
        <Animated.View style={styles.notificationDot}>
          <View style={styles.dotInner} />
        </Animated.View>
      )}
    </AnimatedPressable>
  );
}

const FAB_SIZE = 68;

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    zIndex: 999,
    // Sombra dramática para que o FAB "flutue" sobre o conteúdo
    shadowColor: "#0d9488",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.40,
    shadowRadius: 16,
    elevation: 20,
  },
  glowRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: "rgba(45, 212, 191, 0.25)",
  },
  avatarContainer: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    borderWidth: 2.5,
    borderColor: "rgba(45, 212, 191, 0.60)",
    overflow: "hidden",
    backgroundColor: "#134e4a",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  notificationDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },
  dotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10b981",
  },
});
