import type { SupabaseClient, AuthChangeEvent, Session } from "@supabase/supabase-js";

export async function signIn(
  supabase: SupabaseClient,
  email: string,
  password: string
) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signUp(
  supabase: SupabaseClient,
  email: string,
  password: string
) {
  return supabase.auth.signUp({
    email,
    password,
  });
}

export async function signOut(supabase: SupabaseClient) {
  return supabase.auth.signOut();
}

export function getSession(supabase: SupabaseClient) {
  return supabase.auth.getSession();
}

export function onAuthStateChange(
  supabase: SupabaseClient,
  callback: (
    event: AuthChangeEvent,
    session: Session | null
  ) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}