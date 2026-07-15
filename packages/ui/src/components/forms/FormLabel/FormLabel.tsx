import type { ReactNode } from "react";

import { Text } from "@todo/styling";

export interface FormLabelProps {
  children: ReactNode;
}

export function FormLabel({
  children,
}: FormLabelProps) {
  return (
    <Text
      fontWeight="600"
      marginBottom="$2"
    >
      {children}
    </Text>
  );
}