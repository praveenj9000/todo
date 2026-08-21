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
- ✅ Added: `apps/app/src/features/tasks/hooks/useCreateTask.test.tsx` asserts the paged-mode cache is written to directly (not the infinite-scroll cache) when `FEATURES` is in paged mode.
- ✅ Added: equivalent tests for `useUpdateTask`/`useDeleteTask`.
- ✅ Added: inverse-mode tests (`*.infiniteScroll.test.tsx`) for create/update/delete, mocking `@/config/features` to force the scroll-mode branch, asserting the scroll cache updates and the paged cache stays untouched.
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

---

## 3. `SortableList` / `List` / `AsyncList` have no test coverage

**Why:** these components depend on `react-native-draggable-flatlist`, `@dnd-kit/*`, and `@tanstack/react-virtual` — all of which expect real browser layout and pointer-event APIs (`ResizeObserver`, `getBoundingClientRect`, pointer capture) that jsdom does not implement reliably. Testing them meaningfully needs either a real-browser test runner (e.g. Playwright component testing) or substantial jsdom polyfilling, which risks producing tests that pass without actually exercising real drag/virtualization behavior.

**Status:** deliberately deferred, not overlooked. `AddTaskForm` and `useCreateTask`'s cache logic are covered as of the `apps/app` testing setup; the list primitives are not.

As of this pass, also covered: `TaskFilters`, `TaskRow`, `TaskItem` (non-draggable path, `@todo/ui/sortable` mocked out), `LoginForm`, `RegisterForm`, plus `useUpdateTask`/`useDeleteTask` paged-cache regressions. `TaskList` remains untested for the same reason as the list primitives — it directly composes `AsyncList`/`List`, which branch into `SortableList` or `VirtualizedList` depending on config.

**When to revisit:** if this template gets reused for a project where list/drag correctness is high-stakes enough to justify a Playwright-based test setup, or if a regression in these components actually occurs and needs a guarding test written retroactively.

---

## 4. End-to-End (E2E) testing — deferred, not yet started

**What this is:** true end-to-end/UI testing — driving the actual running
app the way a real user would (open the app, tap "Add", type a title, tap
"Delete", etc.) — as opposed to the unit/component tests that exist today,
which test pieces in isolation with dependencies mocked.

**Status:** started, web-only. Native (Maestro) still deferred until it's actually added to the app.

**Scope, current:** web only, via Playwright, against a real dedicated
Supabase test project (not mocked) — chosen because this app's actual bugs
so far (paged-cache mismatch, realtime replica-identity) were backend-
integration issues a mock can't surface. Scope is deliberately narrow: a
handful of smoke specs (login, task CRUD, task linking), not a mirror of
the unit/component suite.

- **Web** — [Playwright](https://playwright.dev). Drives a real browser
  (Chromium/WebKit/Firefox), standard choice for Expo web builds.
- **Native (iOS/Android)** — [Maestro](https://maestro.mobile.dev) is the
  likely pick over Detox: simpler YAML-based flows, drives a built app via
  accessibility identifiers without needing Detox's deeper native-build
  integration. Detox remains an option if finer-grained control ends up
  necessary.

**Setup required (outside this repo, per-developer):**

- A separate Supabase project used only for E2E, migrated identically to
  prod but never touching real data.
- One fixed test user in that project.
- A local `.env.e2e` in the repo root (gitignored) with that project's
  URL/key, the test user's credentials, and its project ref
  (`E2E_PROJECT_REF`) — see `docs/setup.md` for the full one-time setup.
- `pnpm db:push:e2e` applies the current migration history to the E2E
  project (run once at setup, and again any time a new migration is
  added — see `docs/supabase.md`).
- `pnpm test:e2e` runs the suite locally.

**Known gap:** the locators in `apps/app/e2e/*.spec.ts` were written
without running against the live app yet — Tamagui's rendered DOM
structure needs confirming and locators adjusted after the first real run.
Don't trust these specs as verified until that's done.

**Native (Maestro):** still fully deferred — add when native support
actually lands in the app, not before.

- _Real test project_ — catches real integration issues (RLS policies, the
  `move_task` RPC, Realtime delivery, replica identity behavior) that a mock
  can't; costs actual Supabase infrastructure and needs a seed/reset strategy
  between test runs so tests don't interfere with each other.
- _Mocked backend_ — fast, no external dependency, but doesn't exercise any
  of the real backend logic — several of the bugs already caught this session
  (paged-cache mismatch, replica identity) were backend-integration issues a
  mock would never have surfaced.
- A hybrid (mocked for most flows, a smaller real-backend suite for
  RLS/RPC/Realtime-specific paths) is also worth considering rather than
  picking one exclusively.

**Why not now:** E2E tests are slow and need real infrastructure (a test
backend, simulators/emulators for native) — they don't fit into the existing
pre-commit hook (`format` → `typecheck` → `test`) the way the current Vitest
suite does. The standard pattern is running E2E in CI only (on PR or on a
schedule), not on every local commit — this repo's CI/E2E split isn't set up
yet either, and would need to be part of this work when it starts.

---

## 5. Additional testing/security layers — status and plan

Beyond the unit/component and E2E suites already in place:

**Added:**

- **ESLint** (`pnpm lint`) — catches issues `tsc`/Prettier don't (unused vars, hooks-rules violations, React-specific pitfalls). Runs in pre-commit alongside format/typecheck/test.
- **Dependency audit** (`pnpm audit`) — runs in CI (non-blocking initially), plus GitHub Dependabot alerts enabled at the repo-settings level.
- **Accessibility (axe)** — `@axe-core/playwright` bolted onto existing E2E specs; checks the already-rendered pages for a11y violations at near-zero extra cost, rather than a separate test suite.
- **SAST (CodeQL)** — free, GitHub-hosted static security analysis, runs on push/PR/weekly schedule. Findings surface under the repo's Security tab.

**Deliberately deferred, with reasoning:**

- **Lighthouse (performance)** — needs a production-like build and a real deployed target to test meaningfully; testing against a local dev server with hot-reload overhead isn't representative. Revisit once CD/EAS builds exist.
- **Database/RLS tests** — a real, higher-priority gap specific to this app (an RLS bug is invisible until it leaks another user's data), not yet built. Natural next step given the E2E Supabase test project already exists: direct SQL/RPC assertions that user A cannot read/write user B's rows. Prioritize this before Lighthouse.
- **DAST (dynamic security scanning, e.g. OWASP ZAP) and penetration testing** — appropriate closer to a real production launch with real user data and a security budget, not for a pre-launch solo-developer project. Revisit at that point, not before.
- **"API/security tests"** as a standalone category — too vague to scope as stated; if it means "unauthorized requests get rejected," that's covered by the RLS testing item above once built. If it means something broader (fuzzing, injection testing), that overlaps with DAST and should be scoped together with it, later.

---

## 6. E2E flakiness under repeated full-suite runs — infrastructure, not code

**Observed:** running `pnpm test:e2e` multiple times in quick succession
against the `todo-e2e` free-tier Supabase project produces inconsistent
results with zero code changes — one clean pass, followed by widespread
timeouts specifically at task-creation waits, followed by a single
isolated flake. This pattern (same code, different outcomes, failures
concentrated at network-bound waits rather than assertions/logic) points
at Supabase connection-pool saturation or free-tier cold-start behavior
under repeated back-to-back runs, not a bug in the app or tests.

**Mitigation applied:** reduced `pagination.spec.ts`'s task-creation
volume (11 → 6), added an explicit generous timeout to
`createTaskAndWaitForSync`'s wait.

**Resolution:** added `pnpm test:e2e:local`, running the full suite
against a local Supabase stack (Docker) instead of the hosted free-tier
project — eliminates connection-pool/cold-start variance entirely, since
there's no network hop or shared infrastructure involved. This is now
the recommended path for day-to-day local iteration; see
`docs/setup.md`'s "Local E2E Testing" section for setup.

`pnpm test:e2e` (hosted) is kept for testing against a real network
backend, and remains the natural path to validate against a future paid
Supabase tier — nothing about the hosted setup was removed.
