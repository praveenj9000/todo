import { YStack } from "tamagui";
import { LoginForm } from "../components/LoginForm";
import { OAuthButtonList } from "../components/OAuthButtonList";

export default function LoginScreen() {
  return (
    <YStack flex={1} justifyContent="center" padding="$4" gap="$4">
      <LoginForm />
      <OAuthButtonList />
    </YStack>
  );
}
