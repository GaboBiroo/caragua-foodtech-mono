import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { GlassPill } from "@/components/ui/GlassPill";
import { useAppStore } from "@/store/useAppStore";
import { FEED_FILTERS } from "@/lib/constants";
import type { DietaryFilter } from "@/types";

// ==============================================================================
// FilterPills — Barra de filtros horizontal com scroll invisível
// ==============================================================================

export function FilterPills() {
  const { activeFilter, setActiveFilter } = useAppStore();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FEED_FILTERS.map((filter) => (
        <GlassPill
          key={filter.key}
          label={filter.label}
          emoji={filter.emoji}
          isActive={activeFilter === filter.key}
          onPress={() => setActiveFilter(filter.key as DietaryFilter)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
