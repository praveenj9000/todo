import {
  Card as TamaguiCard,
  type CardProps as TamaguiCardProps,
} from "tamagui";

export type CardProps = TamaguiCardProps;

export function Card(props: CardProps) {
  return <TamaguiCard {...props} />;
}