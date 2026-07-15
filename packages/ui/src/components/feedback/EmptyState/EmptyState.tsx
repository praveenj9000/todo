import { Column, Text } from "@todo/styling";

export interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <Column
      flex={1}
      justifyContent="center"
      alignItems="center"
      gap="$2"
    >
      <Text
        fontWeight="700"
        fontSize="$6"
      >
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
    </Column>
  );
}