import type {
  PropsWithChildren,
} from "react";

import {
  AuthProvider,
} from "@todo/auth";

import {
  DesignSystemProvider,
} from "@todo/design-system";


export function AppProvider({
  children,
}: PropsWithChildren) {

  return (
    <AuthProvider>
      <DesignSystemProvider>
        {children}
      </DesignSystemProvider>
    </AuthProvider>
  );
}