import {
  type AuthChangeEvent,
  type Session,
} from "@supabase/supabase-js";

import { supabase } from "@todo/supabase";

export const authService = {
  getSession() {
    return supabase.auth.getSession();
  },

  onAuthStateChange(
    callback: (
      event: AuthChangeEvent,
      session: Session | null
    ) => void
  ) {
    return supabase.auth.onAuthStateChange(
      async (event, session) => {
        callback(event, session);
      }
    );
  },

  signOut() {
    return supabase.auth.signOut();
  },

  signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  signUp(email: string, password: string) {
    return supabase.auth.signUp({
      email,
      password,
    });
  },

  resetPassword(email: string) {
    return supabase.auth.resetPasswordForEmail(email);
  }
};