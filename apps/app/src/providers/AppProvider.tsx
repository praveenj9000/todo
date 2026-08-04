import { ReactNode } from "react";
import { DesignSystemProvider } from "@todo/design-system";
import { AuthProvider } from "@/features/auth";

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