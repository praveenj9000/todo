import { Text, YStack } from "tamagui";

export default function HomeScreen() {
  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
    >
      <Text fontSize={24}>
        Todo 🚀
      </Text>
    </YStack>
  );
}