import { YStack } from "tamagui";
import { LoginForm } from "../components/LoginForm";

export default function LoginScreen() {
  return (
    <YStack flex={1} justifyContent="center" padding="$4">
      <LoginForm />
    </YStack>
  );
}
