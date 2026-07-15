import type { ReactNode } from "react";

import type {
  ButtonProps as StylingButtonProps,
} from "@todo/styling";

export interface ButtonProps
  extends Omit<
    StylingButtonProps,
    "children"
  > {
  children: ReactNode;

  loading?: boolean;

  fullWidth?: boolean;
}