import { Text } from "@todo/styling";

export interface FormErrorProps {
  message?: string;
}

export function FormError({
  message,
}: FormErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <Text
      color="red"
      fontSize="$2"
      marginTop="$2"
    >
      {message}
    </Text>
  );
}