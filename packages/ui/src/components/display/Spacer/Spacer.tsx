import {
  Column,
  type ColumnProps,
} from "@todo/styling";

export interface SpacerProps
  extends Omit<ColumnProps, "children"> {
  size?: string | number;
}

export function Spacer({
  size = "$4",
}: SpacerProps) {
  return (
    <Column
      height={size}
      width={size}
    />
  );
}