import { signIn, signOut, signUp } from "@todo/auth";

import { supabase } from "../../../lib/supabase";

export function login(email: string, password: string) {
  return signIn(supabase, email, password);
}

export function register(email: string, password: string) {
  return signUp(supabase, email, password);
}

export function logout() {
  return signOut(supabase);
}
