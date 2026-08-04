import { YStack } from "tamagui";
import { RegisterForm } from "../components/RegisterForm";

export default function RegisterScreen() {
  return (
    <YStack
      flex={1}
      justifyContent="center"
      padding="$4"
    >
      <RegisterForm />
    </YStack>
  );
}