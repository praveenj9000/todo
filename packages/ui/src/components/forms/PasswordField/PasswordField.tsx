import {
  Column,
  Input,
} from "@todo/styling";

import { FormError } from "../FormError";
import { FormLabel } from "../FormLabel";

import type { PasswordFieldProps } from "./PasswordField.types";

export function PasswordField({
  label,
  error,
  ...props
}: PasswordFieldProps) {
  return (
    <Column gap="$2">
      {label && (
        <FormLabel>
          {label}
        </FormLabel>
      )}

      <Input
        secureTextEntry
        size="$4"
        {...props}
      />

      <FormError
        message={error}
      />
    </Column>
  );
}