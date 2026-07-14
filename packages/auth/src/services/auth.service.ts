import {
  type AuthChangeEvent,
  type Session,
} from "@supabase/supabase-js";

import { supabase } from "@todo/supabase";

export const authService = {
  getSession() {
    return supabase.auth.getSession();
  },

  getUser() {
    return supabase.auth.getUser();
  },

  onAuthStateChange(
    callback: (
      event: AuthChangeEvent,
      session: Session | null
    ) => void
  ) {
    return supabase.auth.onAuthStateChange(callback);
  },

  signOut() {
    return supabase.auth.signOut();
  },

  loginWithEmail(email: string, password: string) {
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  signupWithEmail(email: string, password: string) {
    return supabase.auth.signUp({
      email,
      password,
    });
  },

  requestPasswordReset(email: string) {
    return supabase.auth.resetPasswordForEmail(email);
  },

  updatePassword() { },

  changePassword() { },

  verifyResetToken() { },

  resendVerificationEmail() { },

  loginWithGoogle() { },

  loginWithApple() { },

  loginWithGithub() { }
};