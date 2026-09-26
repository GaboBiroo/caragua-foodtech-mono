import React from "react";
import { View, StyleSheet, type ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  FadeIn,
  FadeOut,
  type AnimatedProps,
} from "react-native-reanimated";

// ==============================================================================
// GlassCard — Contêiner Reutilizável com Efeito Liquid Glass (Glassmorphism)
//
// Decisão Arquitetural:
// O BlurView da Expo renderiza blur nativo em iOS (UIVisualEffectView) e
// fallback CSS em Android. Para garantir consistência cross-platform,
// combinamos o blur com camadas de cor semi-transparente e uma borda fina
// branca (border-white/15) que simula reflexo de luz em vidro polido.
//
// O componente aceita 3 intensidades de vidro:
// - "light": sutil, para fundos já escuros (cards sobre gradientes)
// - "medium": padrão, equilíbrio entre legibilidade e transparência
// - "heavy": para modais e bottom sheets que precisam de mais opacidade
// ==============================================================================

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

interface GlassCardProps extends AnimatedProps<ViewProps> {
  /** Intensidade do efeito de vidro */
  intensity?: "light" | "medium" | "heavy";
  /** Intensidade numérica do blur (0-100). Padrão baseado na intensidade */
  blurIntensity?: number;
  /** Cor do brilho de acento na borda (ex: teal para cards destacados) */
  accentBorder?: boolean;
  /** Desativa a animação de entrada fade-in */
  noAnimation?: boolean;
  /** Classes NativeWind adicionais */
  className?: string;
  children: React.ReactNode;
}

export function GlassCard({
  intensity = "medium",
  blurIntensity,
  accentBorder = false,
  noAnimation = false,
  className = "",
  children,
  ...rest
}: GlassCardProps) {
  const intensityMap = {
    light: { blur: 25, bg: "rgba(255,255,255,0.04)" },
    medium: { blur: 40, bg: "rgba(255,255,255,0.07)" },
    heavy: { blur: 60, bg: "rgba(255,255,255,0.12)" },
  };

  const config = intensityMap[intensity];
  const finalBlur = blurIntensity ?? config.blur;

  const borderColor = accentBorder
    ? "rgba(45, 212, 191, 0.30)"
    : "rgba(255, 255, 255, 0.15)";

  const content = (
    <View
      style={[
        styles.container,
        { borderColor },
      ]}
      className={`overflow-hidden rounded-3xl ${className}`}
    >
      <AnimatedBlurView
        intensity={finalBlur}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      {/* Camada de cor sobre o blur para controle fino de opacidade */}
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: config.bg }]}
      />
      {/* Reflexo superior sutil — simula luz incidindo no topo do vidro */}
      <View style={styles.topReflection} />
      {/* Conteúdo real */}
      <View style={styles.content}>{children}</View>
    </View>
  );

  if (noAnimation) return content;

  return (
    <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(200)} {...rest}>
      {content}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    // Sombra sutil de profundidade
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  topReflection: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.20)",
  },
  content: {
    position: "relative",
    zIndex: 1,
  },
});
