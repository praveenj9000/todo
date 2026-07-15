import {
  Separator,
} from "tamagui";

export type DividerProps =
  React.ComponentProps<typeof Separator>;

export function Divider(props: DividerProps) {
  return <Separator {...props} />;
}