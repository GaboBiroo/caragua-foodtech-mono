import React from 'react';
import { NativeWebViewShell } from './src/components/NativeWebViewShell';

/**
 * Casca Nativa (React Native) — CaráFood (https://foddtech.vercel.app/)
 * - Intercepta Intents Externas em /prato/[id] ("Traçar Rota no Maps" -> maps.google.com / waze.com
 *   e "Chamar no WhatsApp" -> wa.me) via onShouldStartLoadWithRequest + Linking.openURL;
 * - Conecta o botão físico Voltar do Android (BackHandler) ao histórico interno da WebView;
 * - Respeita o SafeAreaView no topo verde (#0F382C) para não sobrepor relógio e bateria.
 */
export default function App() {
  return <NativeWebViewShell initialPath="/" />;
}
