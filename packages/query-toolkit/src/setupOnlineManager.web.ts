import { onlineManager } from "@tanstack/react-query";

export function setupOnlineManager() {
  return onlineManager.setEventListener((setOnline) => {
    function update() {
      setOnline(navigator.onLine);
    }

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  });
}
