import {
  Image as TamaguiImage,
} from "tamagui";

export type ImageProps =
  React.ComponentProps<typeof TamaguiImage>;

export function Image(props: ImageProps) {
  return <TamaguiImage {...props} />;
}