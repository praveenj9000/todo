import { useEffect, useRef } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { subscribeToTableChanges } from "@todo/supabase";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth";

import { LISTS_QUERY_KEY } from "../constants/query-keys";

const DEBOUNCE_MS = 300;

export function useListsRealtime() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = subscribeToTableChanges(
      supabase,
      {
        table: "lists",
        filter: `user_id=eq.${user.id}`,
      },
      () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: LISTS_QUERY_KEY });
        }, DEBOUNCE_MS);
      },
    );

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      unsubscribe();
    };
  }, [user, queryClient]);
}
