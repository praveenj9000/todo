import { Button, Text, YStack } from "tamagui";

import type { Provider } from "@supabase/supabase-js";

import { useOAuthSignIn } from "../hooks/useOAuthSignIn";

type Props = {
  provider: Provider;
  label: string;
};

export function OAuthButton({ provider, label }: Props) {
  const { signIn, loading, error } = useOAuthSignIn(provider);

  return (
    <YStack gap="$2">
      <Button onPress={signIn} disabled={loading}>
        {loading ? "Connecting..." : label}
      </Button>

      {error ? <Text color="$red10">{error}</Text> : null}
    </YStack>
  );
}
