import type { ReactNode } from "react";

import {
  Column,
  type ColumnProps,
} from "@todo/styling";

export interface CenterProps extends ColumnProps {
  children: ReactNode;
}

export function Center({
  children,
  ...props
}: CenterProps) {
  return (
    <Column
      flex={1}
      justifyContent="center"
      alignItems="center"
      {...props}
    >
      {children}
    </Column>
  );
}