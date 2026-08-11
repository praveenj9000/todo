import type { SupabaseClient, Provider } from "@supabase/supabase-js";

export type OAuthResult = Awaited<ReturnType<SupabaseClient["auth"]["signInWithOAuth"]>>;

/**
 * Web-only: starts the OAuth redirect flow directly via the browser.
 * On native, use signInWithOAuthNative instead — this function returns
 * a URL rather than redirecting when skipBrowserRedirect is needed,
 * which native callers handle themselves via expo-web-browser.
 */
export async function signInWithOAuthWeb(
  supabase: SupabaseClient,
  provider: Provider,
): Promise<OAuthResult> {
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.origin,
    },
  });
}

/**
 * Native: requests the provider's authorization URL from Supabase
 * without redirecting (skipBrowserRedirect), so the caller can open it
 * via expo-web-browser and handle the deep-link callback itself.
 */
export async function getOAuthUrl(
  supabase: SupabaseClient,
  provider: Provider,
  redirectTo: string,
) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  return data.url;
}

/**
 * Native: exchanges the ?code=... param returned in the deep-link
 * callback URL for a real Supabase session.
 */
export async function exchangeCodeForSession(supabase: SupabaseClient, code: string) {
  return supabase.auth.exchangeCodeForSession(code);
}
