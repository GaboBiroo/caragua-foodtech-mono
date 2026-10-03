import { Stack } from 'expo-router';

// ==============================================================================
// Screen 2 Modal Layout — formSheet Presentation
// Garante o painel deslizante inferior sem perder o contexto do Discovery Feed
// ==============================================================================

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
