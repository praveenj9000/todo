import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@todo/env";

export function createSupabaseClient(storage?: any) {
    return createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {
                storage,
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: false,
            },
        }
    );
}