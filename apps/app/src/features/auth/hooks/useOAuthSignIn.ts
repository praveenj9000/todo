import { useState } from "react";
import { Platform } from "react-native";

import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

import type { Provider } from "@supabase/supabase-js";

import { exchangeCodeForSession, getOAuthUrl, signInWithOAuthWeb } from "@todo/auth";

import { supabase } from "../api/client";

WebBrowser.maybeCompleteAuthSession();

export function useOAuthSignIn(provider: Provider) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signIn() {
    setLoading(true);
    setError("");

    try {
      if (Platform.OS === "web") {
        const { error: oauthError } = await signInWithOAuthWeb(supabase, provider);

        if (oauthError) {
          setError(oauthError.message);
        }

        return;
      }

      const redirectTo = Linking.createURL("auth/callback");
      const authUrl = await getOAuthUrl(supabase, provider, redirectTo);

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo);

      if (result.type !== "success" || !("url" in result)) {
        return;
      }

      const url = new URL(result.url);
      const code = url.searchParams.get("code");

      if (!code) {
        setError("No authorization code returned.");
        return;
      }

      const { error: exchangeError } = await exchangeCodeForSession(supabase, code);

      if (exchangeError) {
        setError(exchangeError.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return {
    signIn,
    loading,
    error,
  };
}
