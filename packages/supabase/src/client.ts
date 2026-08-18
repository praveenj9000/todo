import "react-native-url-polyfill/auto";
import type { SupportedStorage } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@todo/env";
import type { Database } from "@todo/types";

export function createSupabaseClient(storage?: SupportedStorage) {
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
}
