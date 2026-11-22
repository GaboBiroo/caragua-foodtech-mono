import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { NativeWebViewShell } from '@/components/NativeWebViewShell';

// ==============================================================================
// Screen 3: Detalhe do Prato / Restaurante via Casca Nativa (/restaurant/[id].tsx)
// - Abre a rota /prato/[id] dentro da NativeWebViewShell;
// - Intercepta "Traçar Rota no Maps" (maps.google.com / waze.com) e
//   "Chamar no WhatsApp" (wa.me) via onShouldStartLoadWithRequest -> Linking.openURL;
// - Conecta o BackHandler do Android ao histórico da WebView e respeita o
//   SafeAreaView no topo verde (#0F382C).
// ==============================================================================

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const targetId = typeof id === 'string' && id.trim() ? id.trim() : 'post-1';

  return <NativeWebViewShell initialPath={`/prato/${encodeURIComponent(targetId)}`} />;
}
