import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";

/** Wires TanStack Query's connectivity signal to the device's real network state. Call once, near app startup. */
export function setupOnlineManager() {
  return onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
      setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    }),
  );
}
