import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedGradient } from "@/components/ui/AnimatedGradient";
import { GlassCard } from "@/components/ui/GlassCard";

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <AnimatedGradient />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Text style={styles.title}>Explorar Caraguatatuba</Text>
        <View style={styles.content}>
          <GlassCard intensity="medium" className="p-6 mx-4">
            <Text style={styles.cardTitle}>Mapa Gastronômico</Text>
            <Text style={styles.cardText}>
              Visualize todos os restaurantes indexados pelo PostGIS em um mapa
              interativo com filtros por bairro, culinária e distância.
            </Text>
          </GlassCard>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  safe: { flex: 1 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 16,
    letterSpacing: -0.4,
  },
  content: { paddingTop: 24 },
  cardTitle: { color: "#ffffff", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  cardText: { color: "rgba(255,255,255,0.60)", fontSize: 14, lineHeight: 21 },
});
