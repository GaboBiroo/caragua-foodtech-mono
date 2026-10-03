import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

// ==============================================================================
// RestaurantReelCard — Card "Visual-First" do Feed com Tags RAG (Screen 1)
// Concebido para valorizar a fotografia gastronômica em tela cheia (camarão na
// moranga, tainha assada, peixe-espada, polvo à moda caiçara) com camadas Liquid Glass.
// ==============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const REEL_CARD_WIDTH = SCREEN_WIDTH - 28;
const REEL_CARD_HEIGHT = REEL_CARD_WIDTH * 1.35;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface RestaurantReelCardProps {
  id: string;
  restaurantName: string;
  dishName: string;
  dishDescription?: string;
  price: number;
  imageUrl: string;
  distanceMeters?: number;
  neighborhood: string;
  decayedRating: number;
  totalReviews: number;
  isGlutenFree?: boolean;
  isVegan?: boolean;
  aiInsight?: string;
  index: number;
}

export const RestaurantReelCard: React.FC<RestaurantReelCardProps> = ({
  id,
  restaurantName,
  dishName,
  dishDescription,
  price,
  imageUrl,
  distanceMeters = 1200,
  neighborhood,
  decayedRating,
  totalReviews,
  isGlutenFree = false,
  isVegan = false,
  aiInsight,
  index,
}) => {
  const router = useRouter();
  const scale = useSharedValue(1);

  const distanceText =
    distanceMeters < 1000
      ? `${Math.round(distanceMeters)}m`
      : `${(distanceMeters / 1000).toFixed(1)}km`;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 140 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 140 });
  };

  const handleCardPress = () => {
    router.push(`/restaurant/${id}`);
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 90).springify()}>
      <AnimatedPressable
        onPress={handleCardPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.cardContainer, animStyle]}
      >
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.imageBg}
          imageStyle={styles.imageInner}
        >
          {/* Gradiente cinemático de imersão Liquid Glass */}
          <LinearGradient
            colors={[
              'rgba(2, 6, 23, 0.25)',
              'transparent',
              'rgba(2, 6, 23, 0.70)',
              'rgba(2, 6, 23, 0.95)',
            ]}
            locations={[0, 0.25, 0.65, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Top Bar: Distância PostGIS e Nota Decaída */}
          <View style={styles.topRow}>
            <BlurView intensity={40} tint="dark" style={styles.pillGlass}>
              <Text style={styles.pillText}>📍 A {distanceText} • {neighborhood}</Text>
            </BlurView>

            <BlurView intensity={40} tint="dark" style={styles.ratingGlass}>
              <Text style={styles.starText}>⭐ {decayedRating.toFixed(1)}</Text>
              <Text style={styles.reviewsCountText}>({totalReviews})</Text>
            </BlurView>
          </View>

          {/* Rodapé: Tags de Food Safety, Nome do Prato, Restaurante e Preço */}
          <View style={styles.bottomContent}>
            {/* Tags de Segurança Alimentar (Food Safety) */}
            <View style={styles.tagsRow}>
              {isVegan && (
                <View style={styles.tagVegan}>
                  <Text style={styles.tagVeganText}>🌱 VEGANO</Text>
                </View>
              )}
              {isGlutenFree && (
                <View style={styles.tagGluten}>
                  <Text style={styles.tagGlutenText}>🌾 SEM GLÚTEN</Text>
                </View>
              )}
              <View style={styles.tagCaicara}>
                <Text style={styles.tagCaicaraText}>🏖️ CAIÇARA</Text>
              </View>
            </View>

            {/* Nome do Prato em destaque visual */}
            <Text style={styles.dishName} numberOfLines={2}>
              {dishName}
            </Text>

            {dishDescription ? (
              <Text style={styles.dishDescription} numberOfLines={2}>
                {dishDescription}
              </Text>
            ) : null}

            {/* Nome do Restaurante e Preço */}
            <View style={styles.footerRow}>
              <View>
                <Text style={styles.restaurantName}>{restaurantName}</Text>
                {aiInsight && (
                  <Text style={styles.aiInsightText}>🤖 {aiInsight}</Text>
                )}
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>A partir de</Text>
                <Text style={styles.priceValue}>R$ {price.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: REEL_CARD_WIDTH,
    height: REEL_CARD_HEIGHT,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 24,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  imageBg: {
    flex: 1,
    justifyContent: 'space-between',
  },
  imageInner: {
    borderRadius: 28,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  pillGlass: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
    backgroundColor: 'rgba(2, 6, 23, 0.35)',
  },
  pillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  ratingGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
    backgroundColor: 'rgba(2, 6, 23, 0.35)',
  },
  starText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '800',
  },
  reviewsCountText: {
    color: 'rgba(255, 255, 255, 0.60)',
    fontSize: 10,
  },
  bottomContent: {
    padding: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tagVegan: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: 'rgba(52, 211, 153, 0.50)',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagVeganText: {
    color: '#6ee7b7',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  tagGluten: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderColor: 'rgba(251, 191, 36, 0.50)',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagGlutenText: {
    color: '#fde68a',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  tagCaicara: {
    backgroundColor: 'rgba(13, 148, 136, 0.25)',
    borderColor: 'rgba(45, 212, 191, 0.50)',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagCaicaraText: {
    color: '#5eead4',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  dishName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  dishDescription: {
    color: 'rgba(255, 255, 255, 0.70)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  restaurantName: {
    color: '#5eead4',
    fontSize: 15,
    fontWeight: '700',
  },
  aiInsightText: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 11,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceValue: {
    color: '#2dd4bf',
    fontSize: 22,
    fontWeight: '800',
  },
});

export default RestaurantReelCard;
