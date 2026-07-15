import {
  Button as BaseButton,
  Spinner,
} from "@todo/styling";

import type {
  ButtonProps,
} from "./Button.types";

export function Button({
  children,
  loading = false,
  fullWidth = false,
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      width={fullWidth ? "100%" : undefined}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : (
        children
      )}
    </BaseButton>
  );
}