import type { ReactNode } from "react";

import {
  Column,
  ScrollView,
  type ScrollViewProps,
} from "@todo/styling";

export interface ScreenProps
  extends Omit<ScrollViewProps, "children"> {
  children: ReactNode;
  scrollable?: boolean;
}

export function Screen({
  children,
  scrollable = false,
  ...props
}: ScreenProps) {
  if (scrollable) {
    return (
      <ScrollView
        flex={1}
        {...props}
      >
        <Column
          flex={1}
          padding="$4"
          gap="$4"
        >
          {children}
        </Column>
      </ScrollView>
    );
  }

  return (
    <Column
      flex={1}
      padding="$4"
      gap="$4"
    >
      {children}
    </Column>
  );
}