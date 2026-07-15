import {
  Input as TamaguiInput,
} from "tamagui";

export type InputProps =
  React.ComponentProps<typeof TamaguiInput>;

export function Input(props: InputProps) {
  return <TamaguiInput {...props} />;
}