import type { Provider } from "@supabase/supabase-js";

export const OAUTH_PROVIDERS: { provider: Provider; label: string }[] = [
  { provider: "google", label: "Continue with Google" },
  { provider: "github", label: "Continue with GitHub" },
  { provider: "azure", label: "Continue with Microsoft" },
  { provider: "facebook", label: "Continue with Facebook" },
];
