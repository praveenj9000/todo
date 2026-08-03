import { Stack, Redirect, useSegments } from "expo-router";
import { AppProvider } from "../src/providers/AppProvider";
import { useAuth } from "../src/providers/AuthProvider";

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
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}