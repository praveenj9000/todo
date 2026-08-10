import type { SupabaseClient } from "@supabase/supabase-js";

export type TableChangeOptions = {
  table: string;
  schema?: string;
  /** Postgres Changes filter syntax, e.g. `user_id=eq.<uuid>`. Scopes which rows' events this subscription receives — in addition to, not instead of, the table's RLS select policy. */
  filter?: string;
};

/**
 * Subscribes to insert/update/delete events on a table via Supabase
 * Realtime (Postgres Changes). Calls onChange with no arguments on any
 * event — this is intentionally coarse (no diffing/merging of the actual
 * changed row) so callers can just invalidate and refetch, which keeps
 * this safe to combine with optimistic updates and pagination without
 * needing to reason about partial-cache merges.
 *
 * Returns an unsubscribe function.
 */
export function subscribeToTableChanges(
  supabase: SupabaseClient,
  options: TableChangeOptions,
  onChange: () => void,
) {
  const channel = supabase
    .channel(`realtime:${options.table}:${options.filter ?? "all"}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: options.schema ?? "public",
        table: options.table,
        filter: options.filter,
      },
      () => {
        onChange();
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
