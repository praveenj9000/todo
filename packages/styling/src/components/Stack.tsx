import {
  XStack,
  YStack,
} from "tamagui";

type ColumnProps = React.ComponentProps<typeof YStack>;
type RowProps = React.ComponentProps<typeof XStack>;

export type StackProps = ColumnProps;

export function Stack(props: StackProps) {
  return <YStack {...props} />;
}

export function Column(props: ColumnProps) {
  return <YStack {...props} />;
}

export function Row(props: RowProps) {
  return <XStack {...props} />;
}