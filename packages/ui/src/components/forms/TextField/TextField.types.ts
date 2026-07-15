import type { InputProps } from "@todo/styling";

export interface TextFieldProps extends InputProps {
  label?: string;

  error?: string;
}