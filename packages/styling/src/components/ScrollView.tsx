import {
  ScrollView as TamaguiScrollView,
} from "tamagui";

export type ScrollViewProps =
  React.ComponentProps<
    typeof TamaguiScrollView
  >;

export function ScrollView(
  props: ScrollViewProps
) {
  return (
    <TamaguiScrollView
      {...props}
    />
  );
}