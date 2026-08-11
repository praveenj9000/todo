import { YStack } from "tamagui";

import { OAUTH_PROVIDERS } from "../constants/oauth-providers";
import { OAuthButton } from "./OAuthButton";

export function OAuthButtonList() {
  return (
    <YStack gap="$3">
      {OAUTH_PROVIDERS.map(({ provider, label }) => (
        <OAuthButton key={provider} provider={provider} label={label} />
      ))}
    </YStack>
  );
}
