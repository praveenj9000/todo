import { ActivityIndicator } from "react-native";
import { Screen } from "@todo/ui";

export function LoadingScreen() {
  return (
    <Screen
      justifyContent="center"
      alignItems="center"
    >
      <ActivityIndicator />
    </Screen>
  );
}