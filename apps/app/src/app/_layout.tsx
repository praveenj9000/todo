import { Stack } from "expo-router";
import { AppProvider } from "@todo/app-provider";
import { AuthNavigator } from "@/components/AuthNavigator";

export default function RootLayout() {
  return (
    <AppProvider>
      <AuthNavigator>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </AuthNavigator>
    </AppProvider>
  );
}