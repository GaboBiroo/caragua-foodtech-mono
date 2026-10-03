import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { JacquinPraianoFAB } from '@/components/ai/JacquinPraianoFAB';
import { useAppStore } from '@/store/useAppStore';
import '../global.css';

// ==============================================================================
// Root Layout — Topologia Global de Navegação (Expo Router)
// Conforme especificado na Página 1 e 2 do Documento Arquitetural:
// 1. Provedores essenciais (QueryClient, GestureHandler)
// 2. Apresentação modal 'formSheet' para a rota /chat (Screen 2)
// 3. Rota paramétrica /restaurant/[id] (Screen 3)
// 4. JacquinPraianoFAB flutuante operando nativamente a 120fps
// ==============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache de 5 minutos
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const { isAIStreaming } = useAppStore();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" translucent />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#020617' },
          }}
        >
          {/* Navegação por abas principal */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Screen 2: Modal formSheet para Chat com Jacquin Praiano */}
          <Stack.Screen
            name="chat"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: [0.5, 0.85],
              sheetGrabberVisible: true,
              sheetCornerRadius: 28,
              headerShown: false,
            }}
          />

          {/* Screen 3: Perfil do Restaurante com Parallax */}
          <Stack.Screen
            name="restaurant/[id]"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
        </Stack>

        {/* Mascote Flutuante Vivo no canto inferior direito */}
        <JacquinPraianoFAB isProcessing={isAIStreaming} />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
