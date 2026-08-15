import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

// Load explicitly rather than relying on the outer `dotenv -e` wrapper
// in package.json's test:e2e script — guarantees this always reads the
// E2E project's credentials, never whatever happens to already be in
// process.env from another source.
loadEnv({ path: resolve(__dirname, "../../../.env.e2e") });

export default async function globalTeardown() {
  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.E2E_TEST_USER_EMAIL!,
    password: process.env.E2E_TEST_USER_PASSWORD!,
  });

  if (authError) {
    console.log(`[global-teardown] Could not sign in to clean up: ${authError.message}`);
    return;
  }

  const { error: deleteError, count } = await supabase
    .from("tasks")
    .delete({ count: "exact" })
    .like("title", "[e2e-%");

  if (deleteError) {
    console.log(`[global-teardown] Cleanup failed: ${deleteError.message}`);
  } else {
    console.log(`[global-teardown] Deleted ${count ?? 0} leftover E2E task(s).`);
  }
}
