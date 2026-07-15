import {
  XStack,
  YStack,
  type XStackProps,
  type YStackProps,
} from "tamagui";

export type ColumnProps = YStackProps;
export type RowProps = XStackProps;

export function Column(props: ColumnProps) {
  return <YStack {...props} />;
}

export function Row(props: RowProps) {
  return <XStack {...props} />;
}