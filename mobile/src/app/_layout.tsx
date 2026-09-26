import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { JacquinFAB } from "@/components/ai/JacquinFAB";
import { AIBottomSheet } from "@/components/ai/AIBottomSheet";
import "../global.css";

// ==============================================================================
// Root Layout — Provider Wrapper Global do App
// Envolve toda a aplicação com:
// 1. GestureHandlerRootView (necessário para Reanimated/BottomSheet)
// 2. TanStack Query Provider (cache e sincronização com FastAPI)
// 3. StatusBar translúcida (Liquid Glass requer transparência total)
// 4. Jacquin Praiano FAB flutuante (sempre visível)
// 5. AI BottomSheet (overlay do chat)
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
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" translucent />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#020617" },
            animation: "fade",
          }}
        >
          <Stack.Screen name="(tabs)" />
        </Stack>
        {/* O Jacquin Praiano flutua sobre todas as telas */}
        <JacquinFAB />
        {/* BottomSheet de chat com a IA */}
        <AIBottomSheet />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
