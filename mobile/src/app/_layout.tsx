import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';

// ==============================================================================
// Root Layout — Casca Nativa React Native (CaráFood)
// - StatusBar no verde oficial (#0F382C) sem sobrepor relógio ou bateria;
// - Stack principal renderizando a Casca Nativa WebView (NativeWebViewShell)
//   com interceptação de Intents Externas (Maps/Waze/WhatsApp) e BackHandler.
// ==============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0F382C' }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor="#0F382C" translucent={false} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FAF7F2' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
          <Stack.Screen
            name="restaurant/[id]"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
