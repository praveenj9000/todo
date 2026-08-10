# Testing Notes — Regressions to Cover

This file tracks real bugs found during development that should have dedicated
test coverage, but don't yet — either because the coverage requires
infrastructure not yet built (`apps/app` testing setup, E2E), or because they
were fixed inline and the test was deferred. Each entry should be removed once
an actual test exists that would catch the regression if reintroduced.

---

## 1. Paged-mode optimistic cache gap

**What broke:** `useCreateTask`, `useUpdateTask`, and `useDeleteTask` originally
wrote their optimistic updates unconditionally to the infinite-scroll cache key
(`[...TASKS_QUERY_KEY, filter, sort]`), regardless of which pagination mode was
active. When `FEATURES.infiniteScroll.enabled` is `false`, the screen actually
reads from a different cache key and shape
(`[...TASKS_QUERY_KEY, "paged", filter, sort, page, pageSize]`,
`{ tasks, totalCount }`). The optimistic write landed in a cache entry nothing
was reading — a silent no-op. The UI only appeared to update because
`onSettled`'s invalidate-and-refetch (and later, Realtime) happened to land
fast enough to look instant.

**Why type-checking didn't catch it:** both cache shapes are individually valid
`setQueryData` calls — there's no type-level contradiction, only a runtime
mismatch between "what key this hook writes to" and "what key the active
screen reads from."

**Fix applied:** `useCreateTask`/`useUpdateTask`/`useDeleteTask` now branch on
`IS_PAGED` (mirroring the pattern `useMoveTask` already used) and write to
whichever cache is actually active.

**Test coverage needed:**

- Once `apps/app` hook testing exists (React Testing Library + `QueryClient`
  test harness + mocked Supabase client), add a test that renders each
  mutation hook with `FEATURES.infiniteScroll.enabled = false`, fires the
  mutation, and asserts the _paged_ query key's cache — not the scroll one —
  reflects the optimistic change.
- Repeat with `infiniteScroll.enabled = true` asserting the scroll cache
  updates and the paged cache is untouched.
- `packages/query-toolkit`'s existing `pagedCache.test.ts` already covers the
  underlying `setPagedCacheItems` primitive in isolation — that's necessary
  but not sufficient; it doesn't catch a hook calling the _wrong_ primitive
  for the active mode, which is what actually happened here.

---

## 2. Realtime DELETE/UPDATE events silently dropped without `REPLICA IDENTITY FULL`

**What broke:** the `tasks` table used Postgres's default replica identity
(`DEFAULT`), which only includes primary-key columns in the replicated "old
row" payload for `UPDATE`/`DELETE` events. The Realtime subscription filters
by `user_id=eq.<uuid>` — a non-primary-key column — so for `DELETE`/`UPDATE`
events, the filter had no `user_id` value to match against and Supabase
silently dropped the event for every subscriber, including the originating
client's other open tabs/devices. `INSERT` events were unaffected, since the
full new row is always included regardless of replica identity — which is why
create-sync worked while delete/update sync silently didn't.

**Why this was hard to notice:** the tab that performed the delete/update
self-healed via its own `onSettled` invalidate, making the feature look
correct when tested in a single tab. The bug was only visible from a _second,
passive_ tab/connection.

**Fix applied:** `alter table public.tasks replica identity full;` (migration
`tasks_replica_identity_full`).

**Test coverage needed:**

- This is a live Postgres replication behavior, not pure application logic —
  not meaningfully unit-testable. Needs an integration/E2E test once that
  infrastructure exists (e.g. Playwright): open two authenticated Supabase
  client connections as the same user, perform a delete/update on one, assert
  the other's realtime subscription callback fires within a timeout.
- General rule to apply going forward, worth checking any time a new
  realtime-enabled table is added: if a Postgres Changes subscription filters
  on any column other than the primary key, that table needs
  `replica identity full`, or `DELETE`/`UPDATE` events on it will silently
  fail to match the filter. `INSERT` is not affected by this and does not
  need it.

---

## General pattern behind both bugs

Both regressions share a shape worth naming: **a piece of state (query cache
key, replication payload) had more than one valid-looking configuration, and
the code silently picked/produced the wrong one for the actual runtime mode.**
Neither was caught by `tsc` or by manually testing the "happy path" in a single
session/tab — both needed either a second cache-mode configuration or a second
observer (tab/connection) to become visible at all. When adding new
pagination modes, cache shapes, or realtime-enabled tables in the future,
explicitly test the _non-default_ mode/configuration and, where relevant, a
second passive observer — not just the mode currently active in
`config/features.ts`.
