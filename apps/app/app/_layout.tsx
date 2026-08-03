import { Stack } from "expo-router";
import { DesignSystemProvider } from "@todo/design-system";

export default function RootLayout() {
  return (
    <DesignSystemProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </DesignSystemProvider>
  );
}