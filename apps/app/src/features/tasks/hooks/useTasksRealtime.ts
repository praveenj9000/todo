import { useEffect, useRef } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { subscribeToTableChanges } from "@todo/supabase";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth";

import { TASKS_QUERY_KEY } from "../constants/query-keys";

const DEBOUNCE_MS = 300;

/**
 * Keeps the task list live across devices/tabs: any insert, update, or
 * delete on another connection for the current user invalidates the
 * tasks query, triggering a refetch — the same mechanism our own
 * mutations already use in onSettled. Does not attempt to merge the
 * changed row directly into the cache; see subscribeToTableChanges.
 */
export function useTasksRealtime() {
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
        table: "tasks",
        filter: `user_id=eq.${user.id}`,
      },
      () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
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
