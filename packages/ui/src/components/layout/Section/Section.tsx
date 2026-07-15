import type { ReactNode } from "react";

import {
  Column,
  type ColumnProps,
} from "@todo/styling";

export interface SectionProps extends ColumnProps {
  children: ReactNode;
}

export function Section({
  children,
  ...props
}: SectionProps) {
  return (
    <Column
      width="100%"
      gap="$3"
      {...props}
    >
      {children}
    </Column>
  );
}