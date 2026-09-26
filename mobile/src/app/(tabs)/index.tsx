import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { AnimatedGradient } from "@/components/ui/AnimatedGradient";
import { FilterPills } from "@/components/feed/FilterPills";
import { DiscoveryCard } from "@/components/feed/DiscoveryCard";

// ==============================================================================
// Discovery Feed — Tela Principal do App
// Feed vertical com cards visuais dominantes (estilo Reels/TikTok).
// Fundo: gradiente animado reagindo sutilmente.
// Header: busca Spotlight com transparência de vidro + pílulas de filtro.
// ==============================================================================

// Dados mockados para demonstração visual
const MOCK_DISHES = [
  {
    restaurantName: "Quiosque Canto Bravo",
    dishName: "Isca de Badejo com Molho Tártaro Caiçara",
    dishDescription: "Badejo fresco do litoral norte empanado artesanalmente.",
    price: 68.0,
    imageUrl: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&q=80",
    distanceText: "A 1.2km",
    neighborhood: "Martin de Sá",
    decayedRating: 4.85,
    totalReviews: 412,
    aiInsight: "A IA destaca o peixe do dia",
    tags: ["SEM GLÚTEN"],
  },
  {
    restaurantName: "Cantina Caiçara Tradição",
    dishName: "Moqueca Vegana de Palmito Pupunha",
    dishDescription: "Palmito da mata atlântica com leite de coco e dendê.",
    price: 54.0,
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80",
    distanceText: "A 800m",
    neighborhood: "Centro",
    decayedRating: 4.80,
    totalReviews: 320,
    aiInsight: "Favorito dos veganos",
    tags: ["VEGANO", "SEM GLÚTEN"],
  },
  {
    restaurantName: "Mar & Terra Gourmet",
    dishName: "Risoto de Camarão Rosa com Limão Siciliano",
    dishDescription: "Camarões flambados na cachaça artesanal da região.",
    price: 89.0,
    imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80",
    distanceText: "A 2.5km",
    neighborhood: "Indaiá",
    decayedRating: 4.62,
    totalReviews: 198,
    tags: ["PREMIUM"],
  },
];

export default function DiscoveryFeed() {
  return (
    <View style={styles.container}>
      {/* Fundo gradiente animado vivo */}
      <AnimatedGradient />

      <SafeAreaView style={styles.safe} edges={["top"]}>
        {/* Header com Busca Spotlight */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Boa noite, parceiro! 🌊</Text>
            <Text style={styles.location}>📍 Caraguatatuba, SP</Text>
          </View>
        </View>

        {/* Barra de Busca Glass */}
        <View style={styles.searchWrapper}>
          <BlurView intensity={30} tint="dark" style={styles.searchBar}>
            <Text style={styles.searchPlaceholder}>
              🔍 Pesquisar pratos, restaurantes...
            </Text>
          </BlurView>
        </View>

        {/* Pílulas de Filtro */}
        <FilterPills />

        {/* Feed de Discovery Cards */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feed}
        >
          {MOCK_DISHES.map((dish, index) => (
            <DiscoveryCard key={index} {...dish} index={index} />
          ))}
          {/* Espaçamento inferior para não colar na tab bar */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.4,
  },
  location: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.55)",
    fontWeight: "500",
    marginTop: 3,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBar: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.10)",
    overflow: "hidden",
  },
  searchPlaceholder: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 14,
    fontWeight: "500",
  },
  feed: {
    paddingTop: 8,
  },
});
