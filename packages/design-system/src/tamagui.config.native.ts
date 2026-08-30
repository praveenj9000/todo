import { createTamagui } from "tamagui";
import { config } from "@tamagui/config";
import { createAnimations } from "@tamagui/animations-moti";

const animations = createAnimations({
  default: { type: "spring", damping: 20, mass: 1.2, stiffness: 250 },
  quick: { type: "spring", damping: 20, mass: 1.2, stiffness: 250 },
  medium: { type: "spring", damping: 10, mass: 0.9, stiffness: 100 },
  slow: { type: "spring", damping: 20, mass: 1.2, stiffness: 60 },
});

const tamaguiConfig = createTamagui({
  ...config,
  animations,
});

export default tamaguiConfig;

export type AppConfig = typeof tamaguiConfig;
