import {
  Column,
  Input,
} from "@todo/styling";

import { FormError } from "../FormError";
import { FormLabel } from "../FormLabel";

import type { TextFieldProps } from "./TextField.types";

export function TextField({
  label,
  error,
  ...props
}: TextFieldProps) {
  return (
    <Column gap="$2">
      {label && (
        <FormLabel>
          {label}
        </FormLabel>
      )}

      <Input
        size="$4"
        {...props}
      />

      <FormError
        message={error}
      />
    </Column>
  );
}