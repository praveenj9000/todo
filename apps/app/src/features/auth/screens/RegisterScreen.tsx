import { YStack } from "tamagui";
import { RegisterForm } from "../components/RegisterForm";
import { OAuthButtonList } from "../components/OAuthButtonList";

export default function RegisterScreen() {
  return (
    <YStack flex={1} justifyContent="center" padding="$4" gap="$4">
      <RegisterForm />
      <OAuthButtonList />
    </YStack>
  );
}
