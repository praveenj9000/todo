import { ReactNode } from "react";
import { DesignSystemProvider } from "@todo/design-system";
import { AuthProvider } from "./AuthProvider";

type Props = {
  children: ReactNode;
};

export function AppProvider({ children }: Props) {
  return (
    <DesignSystemProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </DesignSystemProvider>
  );
}