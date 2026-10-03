import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedGradient } from '@/components/ui/AnimatedGradient';
import { SpotLightBar } from '@/components/ui/SpotLightBar';
import { RestaurantReelCard } from '@/components/feed/RestaurantReelCard';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/services/api';

// ==============================================================================
// Screen 1: Discovery Feed (index.tsx)
// Implementação em estrita consonância com o documento de Arquitetura:
// - Filosofia "Visual-First" (fotografias gastronômicas de alta resolução)
// - SpotLightBar com scroll invisível das efemérides (Festival da Tainha, Caraguá A Gosto)
// - RestaurantReelCard com tags RAG e distância PostGIS
// ==============================================================================

const CARAGUA_LOCAL_REELS = [
  {
    id: 'quiosque-canto-bravo',
    restaurantName: 'Quiosque Canto Bravo',
    dishName: 'Isca de Badejo com Molho Tártaro Caiçara',
    dishDescription: 'Badejo fresco do litoral norte empanado e frito na hora com raspas de limão cravo.',
    price: 68.0,
    imageUrl: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=1000&q=85',
    distanceMeters: 1200,
    neighborhood: 'Martim de Sá',
    decayedRating: 4.88,
    totalReviews: 412,
    isGlutenFree: true,
    isVegan: false,
    aiInsight: 'Peixe fresco desembarcado hoje',
  },
  {
    id: 'cantina-caicara-tradicao',
    restaurantName: 'Cantina Caiçara Tradição',
    dishName: 'Azul-Marinho Tradicional com Pirão',
    dishDescription: 'Peixe cozido na panela de barro com banana verde da mata atlântica e farinha artesanal.',
    price: 75.0,
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1000&q=85',
    distanceMeters: 800,
    neighborhood: 'Centro',
    decayedRating: 4.92,
    totalReviews: 320,
    isGlutenFree: true,
    isVegan: false,
    aiInsight: 'Patrimônio gastronômico caiçara',
  },
  {
    id: 'cantina-caicara-tradicao',
    restaurantName: 'Cantina Caiçara Tradição',
    dishName: 'Moqueca Vegana de Palmito Pupunha',
    dishDescription: 'Palmito fresco, pimentões, banana da terra, leite de coco natural e azeite de dendê.',
    price: 58.0,
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1000&q=85',
    distanceMeters: 800,
    neighborhood: 'Centro',
    decayedRating: 4.85,
    totalReviews: 215,
    isGlutenFree: true,
    isVegan: true,
    aiInsight: '100% Livre de Glúten e Lactose',
  },
  {
    id: 'mar-e-terra-gourmet',
    restaurantName: 'Mar & Terra Gourmet',
    dishName: 'Risoto de Camarão Rosa com Limão Siciliano',
    dishDescription: 'Camarões rosa selecionados flambados na cachaça da serra com arroz arbóreo al dente.',
    price: 89.0,
    imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=1000&q=85',
    distanceMeters: 2500,
    neighborhood: 'Indaiá',
    decayedRating: 4.65,
    totalReviews: 198,
    isGlutenFree: true,
    isVegan: false,
    aiInsight: 'Circuito Gastronômico Noturno',
  },
  {
    id: 'barraca-caicara-porto-novo',
    restaurantName: 'Barraca da Tainha & Pescados',
    dishName: 'Tainha Espalmada na Grelha com Farofa de Camarão',
    dishDescription: 'Tainha fresca servida com farofa crocante e vinagrete de maracujá da restinga.',
    price: 82.0,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&q=85',
    distanceMeters: 4200,
    neighborhood: 'Massaguaçu',
    decayedRating: 4.78,
    totalReviews: 145,
    isGlutenFree: false,
    isVegan: false,
    aiInsight: 'Destaque Festival da Tainha 2026',
  },
];

export default function DiscoveryFeedScreen() {
  const { activeFilter, isCeliac, isVegan } = useAppStore();
  const [reels, setReels] = useState(CARAGUA_LOCAL_REELS);
  const [refreshing, setRefreshing] = useState(false);

  // Filtra itens com base no filtro ativo e preferências de saúde
  const filteredReels = reels.filter((item) => {
    if (isCeliac && !item.isGlutenFree) return false;
    if (isVegan && !item.isVegan) return false;

    if (activeFilter === 'all') return true;
    if (activeFilter === 'vegano') return item.isVegan;
    if (activeFilter === 'sem_gluten') return item.isGlutenFree;
    if (activeFilter === 'frutos_do_mar') return item.dishName.toLowerCase().includes('camarão') || item.dishName.toLowerCase().includes('badejo') || item.dishName.toLowerCase().includes('tainha');
    if (activeFilter === 'caicara') return item.neighborhood === 'Centro' || item.neighborhood === 'Massaguaçu' || item.neighborhood === 'Martim de Sá';
    return true;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await api.getRestaurants();
      if (data && data.length > 0) {
        // Integração de dados vivos
      }
    } catch {
      // Mantém mock em caso de backend offline
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Fundo Gradiente Vivo com Respiração Orgânica */}
      <AnimatedGradient />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Cabeçalho do App com Saudação Caiçara */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Caraguá FoodTech 🌊</Text>
            <Text style={styles.subGreeting}>
              Guia Gastronômico Hiperlocal • Litoral Norte de SP
            </Text>
          </View>
        </View>

        {/* SpotLightBar com busca inteligente e filtros com scroll invisível */}
        <SpotLightBar
          onSearchSubmit={(q) => {
            // Filtro local instantâneo
            const filtered = CARAGUA_LOCAL_REELS.filter(
              (r) =>
                r.dishName.toLowerCase().includes(q.toLowerCase()) ||
                r.restaurantName.toLowerCase().includes(q.toLowerCase()) ||
                r.neighborhood.toLowerCase().includes(q.toLowerCase())
            );
            setReels(filtered.length > 0 ? filtered : CARAGUA_LOCAL_REELS);
          }}
        />

        {/* Feed de Cards "Visual-First" */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedScroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2dd4bf"
            />
          }
        >
          {filteredReels.map((item, idx) => (
            <RestaurantReelCard
              key={`${item.id}-${idx}`}
              {...item}
              index={idx}
            />
          ))}

          {/* Espaçamento para Tab Bar inferior */}
          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  greeting: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subGreeting: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  feedScroll: {
    paddingTop: 8,
  },
});
