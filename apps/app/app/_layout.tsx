import "react-native-reanimated";

import { Redirect, Stack, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useAuth } from "@/features/auth";
import { AppProvider } from "@/providers/AppProvider";

function RootNavigator() {
  const { loading, session } = useAuth();
  const segments = useSegments();

  if (loading) {
    return null;
  }

  const inAuthGroup = segments[0] === "(auth)";

  if (!session && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }

  if (session && inAuthGroup) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <RootNavigator />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
