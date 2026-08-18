import type { ReactNode } from "react";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "./tamagui.config";

type Props = {
  children: ReactNode;
};

export function DesignSystemProvider({ children }: Props) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      {children}
    </TamaguiProvider>
  );
}
