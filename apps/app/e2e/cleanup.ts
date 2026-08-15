import { createClient } from "@supabase/supabase-js";

export async function deleteAllE2ETasks() {
  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.E2E_TEST_USER_EMAIL!,
    password: process.env.E2E_TEST_USER_PASSWORD!,
  });

  if (authError) {
    console.log(`[cleanup] Could not sign in: ${authError.message}`);
    return;
  }

  const { error: deleteError, count } = await supabase
    .from("tasks")
    .delete({ count: "exact" })
    .like("title", "[e2e-%");

  if (deleteError) {
    console.log(`[cleanup] Failed: ${deleteError.message}`);
  } else {
    console.log(`[cleanup] Deleted ${count ?? 0} leftover E2E task(s).`);
  }
}
