import { ReactNode } from "react";
import { DesignSystemProvider } from "@todo/design-system";
import { AuthProvider } from "@/features/auth";
import { QueryProvider } from "./QueryProvider";

type Props = {
  children: ReactNode;
};

export function AppProvider({ children }: Props) {
  return (
    <DesignSystemProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </DesignSystemProvider>
  );
}
