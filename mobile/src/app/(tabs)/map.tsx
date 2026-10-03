import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedGradient } from '@/components/ui/AnimatedGradient';
import { useLocation } from '@/hooks/useLocation';

// ==============================================================================
// Screen: map.tsx — Geolocalização Interativa de Estabelecimentos (PostGIS)
// Especificação da Página 1 e 11 do Documento Arquitetural:
// Discretiza os clusters de Caraguatatuba (Massaguaçu, Martim de Sá, Centro,
// Indaiá, Porto Novo) integrando dados de latitude/longitude SRID 4326.
// ==============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MapCluster {
  id: string;
  name: string;
  tagline: string;
  lat: number;
  lng: number;
  restaurantCount: number;
  highlightDish: string;
}

const CARAGUA_CLUSTERS: MapCluster[] = [
  {
    id: 'c1',
    name: 'Martim de Sá',
    tagline: 'Polo de Quiosques e Frutos do Mar',
    lat: -23.6268,
    lng: -45.3934,
    restaurantCount: 14,
    highlightDish: 'Isca de Badejo com Molho Tártaro Caiçara',
  },
  {
    id: 'c2',
    name: 'Centro Histórico',
    tagline: 'Culinária Caiçara Tradicional & Bares Noturnos',
    lat: -23.6226,
    lng: -45.4124,
    restaurantCount: 18,
    highlightDish: 'Azul-Marinho Tradicional com Pirão',
  },
  {
    id: 'c3',
    name: 'Indaiá',
    tagline: 'Gastronomia Contemporânea à Beira-Mar',
    lat: -23.635,
    lng: -45.421,
    restaurantCount: 9,
    highlightDish: 'Risoto de Camarão Rosa com Limão Siciliano',
  },
  {
    id: 'c4',
    name: 'Massaguaçu',
    tagline: 'Mar Aberto, Pesca Artesanal & Cervejarias',
    lat: -23.595,
    lng: -45.352,
    restaurantCount: 8,
    highlightDish: 'Tainha Espalmada na Brasa',
  },
  {
    id: 'c5',
    name: 'Porto Novo',
    tagline: 'Tradição Pesqueira e Pratos Familiares',
    lat: -23.67,
    lng: -45.43,
    restaurantCount: 7,
    highlightDish: 'Moqueca Mista Caiçara',
  },
];

export default function MapScreen() {
  const router = useRouter();
  const { location } = useLocation();
  const [selectedCluster, setSelectedCluster] = useState<MapCluster>(CARAGUA_CLUSTERS[0]);

  return (
    <View style={styles.container}>
      <AnimatedGradient />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header Superior Glass */}
        <View style={styles.header}>
          <Text style={styles.title}>Mapa Gastronômico PostGIS</Text>
          <Text style={styles.subtitle}>
            Caraguatatuba • SRID 4326 WGS-84 • Índices H3 Res 8/9
          </Text>
        </View>

        {/* Radar Topográfico / Simulação de Mapa Vetorial */}
        <View style={styles.mapSimContainer}>
          <BlurView intensity={35} tint="dark" style={styles.mapRadar}>
            <View style={styles.gridOverlay} />

            {/* Marcadores dos Polos no Mapa */}
            {CARAGUA_CLUSTERS.map((c) => {
              const isSelected = selectedCluster.id === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setSelectedCluster(c)}
                  style={[
                    styles.clusterPin,
                    {
                      // Disposição mockada proporcional às coordenadas do litoral de Caraguá
                      top: c.id === 'c4' ? '15%' : c.id === 'c1' ? '35%' : c.id === 'c2' ? '50%' : c.id === 'c3' ? '65%' : '80%',
                      left: c.id === 'c4' ? '68%' : c.id === 'c1' ? '60%' : c.id === 'c2' ? '45%' : c.id === 'c3' ? '35%' : '25%',
                    },
                  ]}
                >
                  <View style={[styles.pinOuter, isSelected && styles.pinOuterSelected]}>
                    <View style={[styles.pinInner, isSelected && styles.pinInnerSelected]} />
                  </View>
                  <Text style={[styles.pinLabel, isSelected && styles.pinLabelSelected]}>
                    {c.name}
                  </Text>
                </Pressable>
              );
            })}

            {/* Indicador de GPS do Usuário */}
            <View style={styles.userGpsPin}>
              <View style={styles.userPulse} />
              <View style={styles.userDot} />
            </View>
          </BlurView>
        </View>

        {/* Card de Detalhes do Cluster Selecionado */}
        <View style={styles.detailsContainer}>
          <GlassCard intensity={55} className="p-5">
            <View style={styles.detailHeader}>
              <View>
                <Text style={styles.clusterTitle}>{selectedCluster.name}</Text>
                <Text style={styles.clusterTagline}>{selectedCluster.tagline}</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countNumber}>{selectedCluster.restaurantCount}</Text>
                <Text style={styles.countLabel}>casas</Text>
              </View>
            </View>

            <View style={styles.highlightSection}>
              <Text style={styles.highlightTitle}>ÍCONE GASTRONÔMICO DO BAIRRO:</Text>
              <Text style={styles.highlightDish}>🐟 {selectedCluster.highlightDish}</Text>
            </View>

            <View style={styles.techDetailsRow}>
              <Text style={styles.techText}>
                Coordenadas: {selectedCluster.lat.toFixed(4)}, {selectedCluster.lng.toFixed(4)}
              </Text>
              <Text style={styles.techText}>Raio Indexado: 3.500m</Text>
            </View>

            <Pressable
              onPress={() => router.push('/')}
              style={styles.exploreBtn}
            >
              <Text style={styles.exploreBtnText}>Explorar Restaurantes deste Polo →</Text>
            </Pressable>
          </GlassCard>
        </View>
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
    paddingTop: 12,
    paddingBottom: 10,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: '#2dd4bf',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  mapSimContainer: {
    height: '42%',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  mapRadar: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.25)',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(6, 78, 59, 0.15)',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  clusterPin: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(45, 212, 191, 0.50)',
    backgroundColor: 'rgba(13, 148, 136, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinOuterSelected: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderColor: '#2dd4bf',
    backgroundColor: 'rgba(45, 212, 191, 0.50)',
  },
  pinInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5eead4',
  },
  pinInnerSelected: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffffff',
  },
  pinLabel: {
    color: 'rgba(255, 255, 255, 0.70)',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  pinLabelSelected: {
    color: '#2dd4bf',
    fontSize: 12,
    fontWeight: '800',
  },
  userGpsPin: {
    position: 'absolute',
    top: '48%',
    left: '43%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userPulse: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
  },
  userDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#38bdf8',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clusterTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  clusterTagline: {
    color: 'rgba(255, 255, 255, 0.60)',
    fontSize: 12,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: 'rgba(45, 212, 191, 0.20)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.40)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
  },
  countNumber: {
    color: '#2dd4bf',
    fontSize: 16,
    fontWeight: '800',
  },
  countLabel: {
    color: 'rgba(255, 255, 255, 0.60)',
    fontSize: 9,
    textTransform: 'uppercase',
  },
  highlightSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  highlightTitle: {
    color: '#2dd4bf',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  highlightDish: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  techDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  techText: {
    color: 'rgba(255, 255, 255, 0.40)',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  exploreBtn: {
    backgroundColor: '#0d9488',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  exploreBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
