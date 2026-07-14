import type { PropsWithChildren } from "react";
import { TamaguiProvider } from "tamagui";

import config from "../config/tamagui.config";

export function AppProvider({ children }: PropsWithChildren) {
  return (
    <TamaguiProvider
      config={config}
      defaultTheme="light"
    >
      {children}
    </TamaguiProvider>
  );
}