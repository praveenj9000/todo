import {
  createContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import type {
  User,
  Session,
} from "@supabase/supabase-js";

import { authService } from "./services/auth.service";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;

  signOut: () => Promise<void>;
};

export const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: PropsWithChildren) {

  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {

    authService.getSession()
      .then(({ data }) => {
        setSession(data.session);
        setLoading(false);
      });

    const { data: listener } = authService.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };

  }, []);

  async function signOut() {
    await authService.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        user:session?.user ?? null,
        session,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}