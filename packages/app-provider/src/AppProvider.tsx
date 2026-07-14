import type { PropsWithChildren } from "react";
import { DesignSystemProvider } from "@todo/design-system";

export function AppProvider({ children }: PropsWithChildren) {
    return (
        <DesignSystemProvider>
            {children}
        </DesignSystemProvider>
    );
}