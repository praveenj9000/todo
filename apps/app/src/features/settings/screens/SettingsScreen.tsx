import { Button, YStack } from "tamagui";
import { logout } from "@/features/auth";

export default function SettingsScreen() {
  async function handleLogout() {
    await logout();
  }

  return (
    <YStack flex={1} justifyContent="center" alignItems="center">
      <Button onPress={handleLogout}>Logout</Button>
    </YStack>
  );
}
