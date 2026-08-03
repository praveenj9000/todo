import { createTamagui } from "tamagui";
import { config } from "@tamagui/config";

const tamaguiConfig = createTamagui(config);

export default tamaguiConfig;

export type AppConfig = typeof tamaguiConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}