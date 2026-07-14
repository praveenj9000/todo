import type { ComponentProps } from "react";
import { Text as TamaguiText } from "tamagui";

type TextProps = ComponentProps<typeof TamaguiText>;

export function Text(props: TextProps) {
  return <TamaguiText {...props} />;
}