import type { ReactNode } from "react";

import {
  Card as BaseCard,
  Column,
  type CardProps,
} from "@todo/styling";

export interface AppCardProps extends CardProps {
  children: ReactNode;
}

export function Card({
  children,
  ...props
}: AppCardProps) {
  return (
    <BaseCard
      padding="$4"
      {...props}
    >
      <Column gap="$3">
        {children}
      </Column>
    </BaseCard>
  );
}