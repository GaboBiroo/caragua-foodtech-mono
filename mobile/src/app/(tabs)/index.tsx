import React from 'react';
import { NativeWebViewShell } from '@/components/NativeWebViewShell';

// ==============================================================================
// Screen 1: Casca Nativa CaráFood (index.tsx)
// - Carrega https://foddtech.vercel.app/ dentro da WebView híbrida;
// - Intercepta "Traçar Rota no Maps" (maps.google.com / waze.com) e
//   "Chamar no WhatsApp" (wa.me) em /prato/[id] via onShouldStartLoadWithRequest
//   e Linking.openURL para acionar os apps nativos do celular;
// - Conecta o botão físico Voltar (Android BackHandler) ao histórico da WebView;
// - Respeita o SafeAreaView no topo verde (#0F382C).
// ==============================================================================

export default function DiscoveryFeedScreen() {
  return <NativeWebViewShell initialPath="/" />;
}
