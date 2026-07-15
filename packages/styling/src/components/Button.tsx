import {
  Button as TamaguiButton,
} from "tamagui";

export type ButtonProps =
  React.ComponentProps<typeof TamaguiButton>;

export function Button(props: ButtonProps) {
  return <TamaguiButton {...props} />;
}