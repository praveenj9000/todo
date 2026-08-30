import type { AppConfig } from "./tamagui.config";

declare module "tamagui" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- required Tamagui module-augmentation pattern
  interface TamaguiCustomConfig extends AppConfig {}
}
