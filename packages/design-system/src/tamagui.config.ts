import { createTamagui } from "tamagui";
import { config } from "@tamagui/config";

const tamaguiConfig = createTamagui(config);

export default tamaguiConfig;

export type AppConfig = typeof tamaguiConfig;

declare module "tamagui" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- required Tamagui module-augmentation pattern
  interface TamaguiCustomConfig extends AppConfig {}
}
