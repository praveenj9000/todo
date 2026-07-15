import { Input } from "@todo/styling";

import type { PasswordFieldProps } from "./PasswordField.types";

export function PasswordField(
  props: PasswordFieldProps
) {
  return (
    <Input
      secureTextEntry
      size="$4"
      {...props}
    />
  );
}