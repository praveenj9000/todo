import { Input, type InputProps } from "@todo/styling";

export interface TextFieldProps extends InputProps {}

export function TextField(props: TextFieldProps) {
  return (
    <Input
      size="$4"
      {...props}
    />
  );
}