import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedGradient } from "@/components/ui/AnimatedGradient";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAppStore } from "@/store/useAppStore";

export default function ProfileScreen() {
  const { isCeliac, isVegan, setDietaryPrefs } = useAppStore();

  return (
    <View style={styles.container}>
      <AnimatedGradient />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Text style={styles.title}>Suas Preferências</Text>

        <View style={styles.content}>
          <GlassCard intensity="medium" className="p-5 mx-4 mb-4">
            <View style={styles.prefRow}>
              <View>
                <Text style={styles.prefTitle}>Sou Celíaco</Text>
                <Text style={styles.prefDesc}>Filtrar sempre por pratos sem glúten</Text>
              </View>
              <Switch
                value={isCeliac}
                onValueChange={(v) => setDietaryPrefs({ isCeliac: v })}
                trackColor={{ true: "#0d9488", false: "rgba(255,255,255,0.12)" }}
                thumbColor="#ffffff"
              />
            </View>
          </GlassCard>

          <GlassCard intensity="medium" className="p-5 mx-4 mb-4">
            <View style={styles.prefRow}>
              <View>
                <Text style={styles.prefTitle}>Sou Vegano</Text>
                <Text style={styles.prefDesc}>Exibir apenas opções 100% vegetais</Text>
              </View>
              <Switch
                value={isVegan}
                onValueChange={(v) => setDietaryPrefs({ isVegan: v })}
                trackColor={{ true: "#10b981", false: "rgba(255,255,255,0.12)" }}
                thumbColor="#ffffff"
              />
            </View>
          </GlassCard>

          <GlassCard intensity="light" accentBorder className="p-5 mx-4">
            <Text style={styles.footerTitle}>Caraguá FoodTech v1.0.0</Text>
            <Text style={styles.footerText}>
              TCC — Centro Universitário Módulo{" "}
            </Text>
            <Text style={styles.footerText}>
              Pipeline RAG de 5 Estágios | PostGIS + pgvector
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
  prefRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  prefTitle: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  prefDesc: { color: "rgba(255,255,255,0.50)", fontSize: 12, marginTop: 2 },
  footerTitle: { color: "#2dd4bf", fontSize: 14, fontWeight: "700", marginBottom: 4 },
  footerText: { color: "rgba(255,255,255,0.40)", fontSize: 12, lineHeight: 18 },
});
