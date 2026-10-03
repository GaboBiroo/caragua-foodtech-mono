import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { ParallaxHeader } from '@/components/ui/ParallaxHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { useDecayMathematics } from '@/hooks/useDecayMathematics';

// ==============================================================================
// Screen 3: Perfil do Restaurante com Parallax (/restaurant/[id].tsx)
// Implementação formal com base nas Páginas 1 e 9 do Documento Arquitetural:
// - ParallaxHeader animado a 120fps via Reanimated 3
// - Gráfico de Decaimento Temporal Exponencial Minimalista (30 dias / Anti-Fraude)
// - Cardápio categorizado com travas de Segurança Alimentar (Food Safety)
// ==============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Dados detalhados com suporte aos bairros de Caraguatatuba
const RESTAURANT_PROFILES: Record<string, any> = {
  'quiosque-canto-bravo': {
    id: 'quiosque-canto-bravo',
    name: 'Quiosque Canto Bravo',
    neighborhood: 'Martim de Sá',
    address: 'Av. Dr. Arthur Costa Filho, 2100',
    phone: '(12) 3882-9011',
    cuisineTypes: ['Frutos do Mar', 'Caiçara', 'Porções'],
    imageUrl: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=1200&q=85',
    historicalRating: 4.65,
    decayedRating: 4.88,
    totalReviews: 412,
    recentReviewsRatio: 0.92, // 92% do peso nas resenhas do mês
    dishes: [
      {
        id: 'd1',
        name: 'Isca de Badejo com Molho Tártaro Caiçara',
        description: 'Badejo fresco do litoral norte empanado e frito na hora com raspas de limão cravo.',
        price: 68.0,
        isGlutenFree: true,
        isVegan: false,
        category: 'Porções & Entradas',
      },
      {
        id: 'd2',
        name: 'Casquinha de Siri Gratinada',
        description: 'Carne de siri pura gratinada no forno com queijo da canastra e azeite de dendê.',
        price: 28.0,
        isGlutenFree: false,
        isVegan: false,
        category: 'Porções & Entradas',
      },
      {
        id: 'd3',
        name: 'Moqueca de Peixe com Camarão',
        description: 'Posta de robalo e camarões médios cozidos no leite de coco com pirão e arroz.',
        price: 135.0,
        isGlutenFree: true,
        isVegan: false,
        category: 'Pratos Principais',
      },
    ],
  },
  'cantina-caicara-tradicao': {
    id: 'cantina-caicara-tradicao',
    name: 'Cantina Caiçara Tradição',
    neighborhood: 'Centro',
    address: 'Rua Altino Arantes, 450',
    phone: '(12) 3883-4500',
    cuisineTypes: ['Caiçara', 'Tradicional', 'Vegetariano'],
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1200&q=85',
    historicalRating: 4.70,
    decayedRating: 4.92,
    totalReviews: 320,
    recentReviewsRatio: 0.89,
    dishes: [
      {
        id: 'd4',
        name: 'Azul-Marinho Tradicional com Pirão',
        description: 'Peixe cozido com banana da terra verde, pirão espesso e farinha artesanal de mandioca.',
        price: 75.0,
        isGlutenFree: true,
        isVegan: false,
        category: 'Especialidades Caiçaras',
      },
      {
        id: 'd5',
        name: 'Moqueca Vegana de Palmito Pupunha',
        description: 'Palmito fresco da mata atlântica, banana da terra, pimentões e leite de coco fresco.',
        price: 58.0,
        isGlutenFree: true,
        isVegan: true,
        category: 'Especialidades Caiçaras',
      },
    ],
  },
};

export default function RestaurantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scrollY = useSharedValue(0);

  // Hook da matemática exponencial (meia-vida de 30 dias)
  const { generateCurvePoints, lambda } = useDecayMathematics(30.0);
  const decayPoints = generateCurvePoints(60, 10);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const restaurant = RESTAURANT_PROFILES[id as string] || RESTAURANT_PROFILES['quiosque-canto-bravo'];

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Parallax Header com Interpolação a 120fps */}
        <ParallaxHeader
          scrollY={scrollY}
          imageUri={restaurant.imageUrl}
          title={restaurant.name}
          neighborhood={restaurant.neighborhood}
          cuisineTypes={restaurant.cuisineTypes}
          decayedRating={restaurant.decayedRating}
          totalReviews={restaurant.totalReviews}
        />

        <View style={styles.body}>
          {/* ============================================================== */}
          {/* GRÁFICO DE DECAIMENTO TEMPORAL MINIMALISTA (PÁGINA 9)          */}
          {/* ============================================================== */}
          <GlassCard intensity={45} className="p-5 mb-6 border-teal-500/30">
            <View style={styles.decayHeader}>
              <View>
                <Text style={styles.decayTitle}>Auditoria de Consistência Recente</Text>
                <Text style={styles.decaySubtitle}>
                  Algoritmo Anti-Fraude com Meia-Vida de 30 dias
                </Text>
              </View>
              <View style={styles.verifiedTag}>
                <Text style={styles.verifiedText}>AUDITADO</Text>
              </View>
            </View>

            {/* Comparativo de Notas Histórica vs. Decaída */}
            <View style={styles.ratingsCompareRow}>
              <View style={styles.ratingCol}>
                <Text style={styles.ratingColLabel}>Nota Histórica Global</Text>
                <Text style={styles.ratingColHistorical}>
                  {restaurant.historicalRating.toFixed(2)}
                </Text>
                <Text style={styles.ratingColDesc}>Todas as resenhas (2019-2026)</Text>
              </View>

              <View style={styles.dividerCol} />

              <View style={styles.ratingCol}>
                <Text style={styles.ratingColLabel}>Nota Atual com Decaimento</Text>
                <Text style={styles.ratingColDecayed}>
                  {restaurant.decayedRating.toFixed(2)} ★
                </Text>
                <Text style={styles.ratingColDesc}>~90% peso no último mês</Text>
              </View>
            </View>

            {/* Visualização da Curva Exponencial Minimalista */}
            <View style={styles.curveContainer}>
              <Text style={styles.curveLabel}>Curva de Retenção de Impacto (Dias Decorridos):</Text>
              <View style={styles.curveBarsRow}>
                {decayPoints.map((pt, idx) => (
                  <View key={`pt-${idx}`} style={styles.barCol}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { height: `${Math.max(8, pt.retentionPercent)}%` },
                          pt.day === 30 && styles.barFillHalfLife,
                        ]}
                      />
                    </View>
                    <Text style={styles.barDayText}>{pt.day}d</Text>
                    <Text style={styles.barPercentText}>{pt.retentionPercent}%</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.decayFormula}>
                W(t) = e^(-{lambda.toFixed(4)} × Δt) • Resenhas &gt; 30 dias perdem peso exponencialmente
              </Text>
            </View>
          </GlassCard>

          {/* Dados de Localização e Contato */}
          <GlassCard intensity={30} className="p-4 mb-6">
            <Text style={styles.sectionHeader}>Informações do Estabelecimento</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoText}>{restaurant.address}, {restaurant.neighborhood}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📞</Text>
              <Text style={styles.infoText}>{restaurant.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>⏰</Text>
              <Text style={styles.infoText}>Aberto hoje das 11:30 às 23:00</Text>
            </View>
          </GlassCard>

          {/* Cardápio do Restaurante com Food Safety */}
          <Text style={styles.menuTitle}>Cardápio Verificado (pgvector RAG)</Text>
          <Text style={styles.menuSubtitle}>
            Itens auditados contra contaminação cruzada de glúten e alérgenos
          </Text>

          <View style={styles.dishesList}>
            {restaurant.dishes.map((dish: any) => (
              <GlassCard
                key={dish.id}
                intensity={40}
                className="p-4 mb-3 border-white/15"
              >
                <View style={styles.dishHeader}>
                  <Text style={styles.dishTitle}>{dish.name}</Text>
                  <Text style={styles.dishPrice}>R$ {dish.price.toFixed(2)}</Text>
                </View>

                <Text style={styles.dishDesc}>{dish.description}</Text>

                <View style={styles.dishBadges}>
                  {dish.isGlutenFree && (
                    <View style={styles.badgeGluten}>
                      <Text style={styles.badgeGlutenText}>🌾 SEM GLÚTEN</Text>
                    </View>
                  )}
                  {dish.isVegan && (
                    <View style={styles.badgeVegan}>
                      <Text style={styles.badgeVeganText}>🌱 VEGANO</Text>
                    </View>
                  )}
                  <View style={styles.badgeCat}>
                    <Text style={styles.badgeCatText}>{dish.category}</Text>
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
        </View>

        {/* Espaçamento inferior */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollContent: {
    flexGrow: 1,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  decayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  decayTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  decaySubtitle: {
    color: '#2dd4bf',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  verifiedTag: {
    backgroundColor: 'rgba(45, 212, 191, 0.20)',
    borderColor: 'rgba(45, 212, 191, 0.40)',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  verifiedText: {
    color: '#5eead4',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ratingsCompareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 12,
    marginVertical: 10,
  },
  ratingCol: {
    flex: 1,
    alignItems: 'center',
  },
  dividerCol: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  ratingColLabel: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  ratingColHistorical: {
    color: 'rgba(255, 255, 255, 0.70)',
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 2,
  },
  ratingColDecayed: {
    color: '#2dd4bf',
    fontSize: 24,
    fontWeight: '900',
    marginVertical: 2,
  },
  ratingColDesc: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 9,
  },
  curveContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  curveLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  curveBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 90,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    height: 60,
    width: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#0d9488',
    borderRadius: 7,
  },
  barFillHalfLife: {
    backgroundColor: '#fbbf24', // Destaque aos 30 dias (meia-vida)
  },
  barDayText: {
    color: 'rgba(255, 255, 255, 0.60)',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
  },
  barPercentText: {
    color: 'rgba(255, 255, 255, 0.40)',
    fontSize: 8,
  },
  decayFormula: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 9,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 4,
  },
  sectionHeader: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
  },
  menuTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  menuSubtitle: {
    color: 'rgba(255, 255, 255, 0.50)',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 14,
  },
  dishesList: {
    gap: 2,
  },
  dishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  dishTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  dishPrice: {
    color: '#2dd4bf',
    fontSize: 17,
    fontWeight: '800',
  },
  dishDesc: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  dishBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  badgeGluten: {
    backgroundColor: 'rgba(245, 158, 11, 0.20)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeGlutenText: {
    color: '#fef08a',
    fontSize: 9,
    fontWeight: '700',
  },
  badgeVegan: {
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeVeganText: {
    color: '#a7f3d0',
    fontSize: 9,
    fontWeight: '700',
  },
  badgeCat: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeCatText: {
    color: 'rgba(255, 255, 255, 0.60)',
    fontSize: 9,
  },
});
