import { createTamagui } from "tamagui";
import { config } from "@tamagui/config";
import { createAnimations } from "@tamagui/animations-css";

const animations = createAnimations({
  default: "ease-in 150ms",
  quick: "ease-in 150ms",
  medium: "ease-in 300ms",
  slow: "ease-in 450ms",
});

const tamaguiConfig = createTamagui({
  ...config,
  animations,
});

export default tamaguiConfig;

export type AppConfig = typeof tamaguiConfig;
