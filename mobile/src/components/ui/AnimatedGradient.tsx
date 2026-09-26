import React from "react";
import { StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolateColor,
} from "react-native-reanimated";

// ==============================================================================
// AnimatedGradient — Fundo Vivo Reagindo ao Scroll
// Gradiente animado contínuo que pulsa entre tons oceânicos e caiçaras,
// dando ao app a sensação de "respiração" característica do Liquid Glass.
// ==============================================================================

const { width, height } = Dimensions.get("window");
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function AnimatedGradient() {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.85 + progress.value * 0.15,
  }));

  return (
    <AnimatedLinearGradient
      colors={["#020617", "#0c4a6e", "#083344", "#064e3b", "#020617"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, animatedStyle]}
    />
  );
}
