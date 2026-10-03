import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// ==============================================================================
// ParallaxHeader — Cabeçalho Parallax Animado a 120fps (Screen 3: Perfil)
// Orquestra a interpolação de escala e desfoque via Reanimated 3 Worklets
// sem gargalos na thread de JavaScript.
// ==============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const PARALLAX_HEADER_HEIGHT = 320;
export const COLLAPSED_HEADER_HEIGHT = 90;

export interface ParallaxHeaderProps {
  scrollY: SharedValue<number>;
  imageUri: string;
  title: string;
  neighborhood: string;
  cuisineTypes: string[];
  decayedRating: number;
  totalReviews: number;
}

export const ParallaxHeader: React.FC<ParallaxHeaderProps> = ({
  scrollY,
  imageUri,
  title,
  neighborhood,
  cuisineTypes,
  decayedRating,
  totalReviews,
}) => {
  const router = useRouter();

  // Efeito Parallax de Zoom e Translação
  const imageAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-PARALLAX_HEADER_HEIGHT, 0, PARALLAX_HEADER_HEIGHT],
      [-PARALLAX_HEADER_HEIGHT / 2, 0, PARALLAX_HEADER_HEIGHT * 0.75],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [-PARALLAX_HEADER_HEIGHT, 0],
      [2, 1],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  // Fade do título superior conforme o scroll atinge o topo
  const compactTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [PARALLAX_HEADER_HEIGHT - 120, PARALLAX_HEADER_HEIGHT - 60],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      {/* Imagem de Fundo com Parallax */}
      <Animated.Image
        source={{ uri: imageUri }}
        style={[styles.backgroundImage, imageAnimatedStyle]}
        resizeMode="cover"
      />

      {/* Gradientes Luminescentes estilo Liquid Glass */}
      <LinearGradient
        colors={[
          'rgba(2, 6, 23, 0.35)',
          'rgba(2, 6, 23, 0.65)',
          'rgba(2, 6, 23, 0.98)',
        ]}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Barra de Navegação Compacta Fixa com Blur */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <BlurView intensity={50} tint="dark" style={styles.backButtonBlur}>
            <Text style={styles.backButtonText}>←</Text>
          </BlurView>
        </Pressable>

        <Animated.View style={[styles.compactTitleWrapper, compactTitleStyle]}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {title}
          </Text>
        </Animated.View>
      </View>

      {/* Informações Centrais em Destaque na Base do Header */}
      <View style={styles.bottomInfo}>
        <View style={styles.badgesRow}>
          <View style={styles.neighborhoodBadge}>
            <Text style={styles.neighborhoodText}>📍 {neighborhood}, Caraguá</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {decayedRating.toFixed(2)}</Text>
            <Text style={styles.reviewsText}>({totalReviews} avaliações)</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <Text style={styles.cuisines}>
          {cuisineTypes.join(' • ')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: PARALLAX_HEADER_HEIGHT,
    width: SCREEN_WIDTH,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#020617',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  compactTitleWrapper: {
    flex: 1,
  },
  compactTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  neighborhoodBadge: {
    backgroundColor: 'rgba(45, 212, 191, 0.20)',
    borderColor: 'rgba(45, 212, 191, 0.40)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  neighborhoodText: {
    color: '#5eead4',
    fontSize: 11,
    fontWeight: '700',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ratingText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '800',
  },
  reviewsText: {
    color: 'rgba(255, 255, 255, 0.60)',
    fontSize: 10,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  cuisines: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
});

export default ParallaxHeader;
