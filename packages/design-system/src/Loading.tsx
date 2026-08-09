import { Spinner, YStack } from "tamagui";

export function Loading() {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center">
      <Spinner />
    </YStack>
  );
}
