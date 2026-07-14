import type { PropsWithChildren } from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import { YStack } from "tamagui";

export function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack
        flex={1}
        padding="$4"
      >
        {children}
      </YStack>
    </SafeAreaView>
  );
}