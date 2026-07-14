import { createClient } from "@supabase/supabase-js";
import { env } from "@todo/env";
import type { Database } from "@todo/types";

export const supabase = createClient<Database>(
    env.supabase.url,
    env.supabase.publishableKey
);