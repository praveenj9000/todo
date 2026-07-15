import {
  Card as TamaguiCard,
} from "tamagui";

type CardProps =
  React.ComponentProps<typeof TamaguiCard>;

export function Card(props: CardProps) {
  return <TamaguiCard {...props} />;
}