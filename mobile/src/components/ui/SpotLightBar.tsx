import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/useAppStore';
import type { DietaryFilter } from '@/types';

// ==============================================================================
// SpotLightBar — Busca Inteligente e Filtros com Scroll Invisível
// Implementação em conformidade estrita com o documento de Arquitetura Front-End:
// - Barra Spotlight translúcida ("Liquid Glass")
// - Pílulas de categorias culturais de Caraguatatuba (Festival da Tainha, Caraguá A Gosto, Caiçara)
// - Scroll horizontal sem barra visível (showsHorizontalScrollIndicator={false})
// ==============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface SpotLightFilterItem {
  id: DietaryFilter;
  label: string;
  emoji: string;
  isSpecialEvent?: boolean;
}

export const CARAGUA_SPOTLIGHT_FILTERS: SpotLightFilterItem[] = [
  { id: 'all', label: 'Todos', emoji: '🍽️' },
  { id: 'caicara', label: 'Festival da Tainha', emoji: '🐟', isSpecialEvent: true },
  { id: 'promocoes', label: 'Caraguá A Gosto', emoji: '🏆', isSpecialEvent: true },
  { id: 'frutos_do_mar', label: 'Frutos do Mar', emoji: '🦐' },
  { id: 'caicara', label: 'Culinária Caiçara', emoji: '🌴' },
  { id: 'vegano', label: 'Vegano', emoji: '🌱' },
  { id: 'sem_gluten', label: 'Sem Glúten (Celíaco)', emoji: '🌾' },
  { id: 'promocoes', label: 'Promoções do Dia', emoji: '🔥' },
];

export interface SpotLightBarProps {
  onSearchSubmit?: (query: string) => void;
  searchPlaceholder?: string;
}

export const SpotLightBar: React.FC<SpotLightBarProps> = ({
  onSearchSubmit,
  searchPlaceholder = 'Buscar peixe fresco, camarão na moranga, quiosques...',
}) => {
  const [searchText, setSearchText] = useState('');
  const { activeFilter, setActiveFilter } = useAppStore();

  const handleFilterPress = (filterId: DietaryFilter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(filterId);
  };

  const handleSearchSubmit = () => {
    if (searchText.trim() && onSearchSubmit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSearchSubmit(searchText.trim());
    }
  };

  return (
    <View style={styles.container}>
      {/* Barra de Busca Spotlight com Liquid Glass */}
      <View style={styles.spotlightSearchWrapper}>
        <BlurView
          intensity={45}
          tint="dark"
          style={styles.spotlightBlur}
        >
          <View style={styles.searchInner}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              placeholderTextColor="rgba(255, 255, 255, 0.45)"
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
              clearButtonMode="while-editing"
            />
          </View>
        </BlurView>
      </View>

      {/* Pílulas de Filtros com Scroll Invisível */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScrollContent}
        style={styles.filtersScroll}
      >
        {CARAGUA_SPOTLIGHT_FILTERS.map((item, idx) => {
          const isSelected = activeFilter === item.id;
          return (
            <SpotLightPill
              key={`${item.id}-${idx}`}
              item={item}
              isSelected={isSelected}
              onPress={() => handleFilterPress(item.id)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

interface SpotLightPillProps {
  item: SpotLightFilterItem;
  isSelected: boolean;
  onPress: () => void;
}

const SpotLightPill: React.FC<SpotLightPillProps> = ({ item, isSelected, onPress }) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.93, { damping: 14, stiffness: 180 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 180 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animStyle, styles.pillWrapper]}
    >
      <BlurView
        intensity={isSelected ? 60 : 30}
        tint="dark"
        style={[
          styles.pillBlur,
          isSelected && styles.pillSelected,
          item.isSpecialEvent && !isSelected && styles.pillSpecialEvent,
        ]}
      >
        <Text style={styles.pillEmoji}>{item.emoji}</Text>
        <Text
          style={[
            styles.pillLabel,
            isSelected && styles.pillLabelSelected,
            item.isSpecialEvent && !isSelected && styles.pillLabelSpecial,
          ]}
        >
          {item.label}
        </Text>
      </BlurView>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 6,
  },
  spotlightSearchWrapper: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  spotlightBlur: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filtersScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pillWrapper: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  pillBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  pillSelected: {
    borderColor: 'rgba(45, 212, 191, 0.60)',
    backgroundColor: 'rgba(13, 148, 136, 0.25)',
  },
  pillSpecialEvent: {
    borderColor: 'rgba(251, 191, 36, 0.40)',
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
  },
  pillEmoji: {
    fontSize: 14,
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.70)',
    letterSpacing: 0.2,
  },
  pillLabelSelected: {
    color: '#2dd4bf',
    fontWeight: '700',
  },
  pillLabelSpecial: {
    color: '#fef08a',
  },
});

export default SpotLightBar;
