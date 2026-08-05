import {
  Text,
  YStack,
} from "tamagui";

type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      padding="$6"
      gap="$2"
    >
      <Text fontSize="$7">
        {title}
      </Text>

      {description && (
        <Text
          color="$gray10"
          textAlign="center"
        >
          {description}
        </Text>
      )}
    </YStack>
  );
}