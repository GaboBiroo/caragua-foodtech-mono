import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
  WithSpringConfig,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

// ==============================================================================
// JacquinPraianoFAB — Floating Action Button Animado a 120fps
// Especificação estrita do Documento Arquitetural (Páginas 4, 5, 6 e 7):
// - Interpolação física via molas (SPRING_PHYSICS)
// - Worklets de Gesture.Pan com detecção de tap e snapping elástico
// - Ciclo respiratório autônomo (pulso lento a 2000ms vs. pulso acelerado a 300ms)
// - Disparo do modal formSheet para /chat via Expo Router
// ==============================================================================

// Configuração física da mola baseada nas diretrizes de UI fluida (sem cortes secos)
const SPRING_PHYSICS: WithSpringConfig = {
  damping: 14,
  mass: 1.2,
  stiffness: 150,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 2,
};

export interface JacquinPraianoFABProps {
  /**
   * Estado propagado pelo hook de Server-Sent Events.
   * Quando true, o mascote altera seu padrão de pulso para indicar processamento.
   */
  isProcessing?: boolean;
}

/**
 * JacquinPraianoFAB
 *
 * O mascote flutuante atua como ponto de entrada para a invocação do BottomSheet da IA.
 * Implementa pan-gestures (arrasto) e animações de pulso contínuo a 120fps,
 * operando exclusivamente na UI Thread via Worklets para mitigar o engasgo da Thread JS.
 */
export const JacquinPraianoFAB: React.FC<JacquinPraianoFABProps> = ({ isProcessing = false }) => {
  const router = useRouter();

  // Valores compartilhados nativamente. Isolados das re-renderizações do React.
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const touchScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  // Orquestração do ritmo respiratório (pulso) baseada no estado de processamento
  useEffect(() => {
    if (isProcessing) {
      // Estado Ocupado: Pulso rápido e acentuado (simulando ansiedade/cálculo)
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 300, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // -1 determina repetição infinita
        true
      );
    } else {
      // Estado de Repouso: Respiração orgânica lenta (simulando a brisa do mar)
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
  }, [isProcessing, pulseScale]);

  // Função encapsulada para ser disparada quando o gesto caracterizar um "Tap" (Clique)
  const openAIModal = () => {
    router.push('/chat');
  };

  // Declaração do PanGesture usando a API mais recente do Gesture Handler
  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Retração imediata da escala ao toque inicial para feedback tátil
      touchScale.value = withSpring(0.9, SPRING_PHYSICS);
    })
    .onUpdate((event) => {
      // Atualização fluida da translação seguindo o dedo do usuário
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      // Lógica de desambiguação: Se o movimento foi mínimo, caracteriza-se como um clique.
      const isTap = Math.abs(event.translationX) < 15 && Math.abs(event.translationY) < 15;
      if (isTap) {
        // runOnJS é mandatório para invocar funções dependentes da Thread JS a partir de um Worklet
        runOnJS(openAIModal)();
      }
      // Efeito elástico "Snapping": Retorna o avatar à origem ancorada
      translateX.value = withSpring(0, SPRING_PHYSICS);
      translateY.value = withSpring(0, SPRING_PHYSICS);
      touchScale.value = withSpring(1, SPRING_PHYSICS);
    });

  // O estilo animado aplica as transformações diretamente na GPU do dispositivo
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        // A escala real é a composição do toque e da respiração
        { scale: touchScale.value * pulseScale.value },
      ],
    };
  });

  return (
    <View className="absolute bottom-8 right-6 z-50" pointerEvents="box-none">
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[animatedStyle, styles.shadowContainer]}
          // O contêiner de borda incorpora o verde-água/teal exigido na especificação visual
          className="w-20 h-20 rounded-full border-[3px] border-emerald-300/60 bg-teal-500 overflow-hidden items-center justify-center"
        >
          {/* Identidade Visual do Jacquin Praiano */}
          {/* Imagem deve carregar os ativos que incluem o chapéu de chef, óculos, bigode e camisa florida */}
          <Image
            source={require('@/assets/images/jacquin-praiano.png')}
            className="w-[120%] h-[120%]"
            resizeMode="cover"
            accessibilityLabel="Assistente Virtual Jacquin Praiano fazendo sinal de joinha"
          />
          {/* Overlap de gradiente sutil para integração luminescente */}
          <View className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-transparent" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    shadowColor: '#0f766e', // teal-700
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 12,
  },
});

export default JacquinPraianoFAB;
