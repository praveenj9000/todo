import {
  Text as BaseText,
  type TextProps,
} from "@todo/styling";

export function TextField(
  props: TextProps
) {
  return (
    <BaseText
      {...props}
    />
  );
}