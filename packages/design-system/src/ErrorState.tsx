import { Button, Text, YStack } from "tamagui";

type ErrorStateProps = {
  title?: string;
  onRetry?: () => void;
};

export function ErrorState({ title = "Something went wrong.", onRetry }: ErrorStateProps) {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$6" gap="$4">
      <Text>{title}</Text>

      {onRetry && <Button onPress={onRetry}>Retry</Button>}
    </YStack>
  );
}
