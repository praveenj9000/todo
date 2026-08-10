# Todo Application Architecture

## Overview

This repository is the foundation for a production-ready cross-platform application built with Expo, React Native, TypeScript, Supabase, and Turborepo.

The architecture is designed around independent features that own their own business logic, making new functionality easy to add, remove, and maintain without affecting the rest of the application.

The long-term goal is to support multiple applications using the same architectural principles while keeping the codebase clean, scalable, and easy to understand. Several pieces of this repo — list rendering, pagination, drag-to-reorder, virtualization, optimistic cache management, offline mutation queuing — were deliberately built as generic, reusable packages rather than task-specific code, so future projects (e.g. an e-commerce or admin product) can reuse them directly.

---

# Core Principles

- Production-first
- Feature-first architecture
- Every feature owns itself
- Clear module boundaries
- Strong TypeScript typing
- Shared UI components
- Minimal code duplication
- Low maintenance
- Scalable from day one
- No circular dependencies
- UI and data-fetching primitives generalized into packages, not tied to any one feature's domain

---

# Technology Stack

## Frontend

- React Native
- Expo
- Expo Router
- TypeScript

## Backend

- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security (RLS)

## Data Fetching

- TanStack Query
  - `useQuery` / `useInfiniteQuery` for reads
  - Optimistic mutations via `@todo/query-toolkit`
  - Persisted query cache (offline read support)
  - Persisted, restart-resumable mutation queue for simple CRUD mutations (see Offline Support)
  - `onlineManager` wired to real device connectivity (`NetInfo` on native, browser events on web)
  - Requires `replica identity full` on any realtime-enabled table when filtering by a non-primary-key column (e.g. `user_id`) — otherwise DELETE/UPDATE events omit that column from the replicated payload and the filter silently drops the event for every subscriber, including the originating client's other sessions.

## Client State

- Zustand

## Lists, Pagination, Drag & Drop

- `@todo/ui` — generic `List` (virtualized), `SortableList` (drag-to-reorder), `AsyncList` (loading/error/empty + pagination wiring), `PaginationToolbar`
- `@tanstack/react-virtual` (web virtualization) / React Native `FlatList` (native virtualization)
- `@dnd-kit/*` (web drag-and-drop) / `react-native-draggable-flatlist` (native drag-and-drop)

## Monorepo

- pnpm Workspaces
- Turborepo

## Database

- Supabase CLI
- SQL Migrations

---

# Repository Structure

```text
todo/

apps/
docs/
packages/
scripts/
supabase/
```

Application:

```text
apps/app/

app/            Expo Router
assets/
src/
```

Application source:

```text
src/

components/
config/
features/
lib/
providers/
```

---

# Feature Architecture

Every feature owns itself.

Example:

```text
features/

auth/
    api/
    components/
    provider/
    screens/
    index.ts

tasks/
    api/
    components/
    constants/
    hooks/
    screens/
    stores/
    types/
    registerMutationDefaults.ts
    index.ts

settings/
    api/
    components/
    screens/
    index.ts
```

A feature should contain everything related to that feature — including its own optimistic-mutation hooks, built on top of the generic primitives in `@todo/query-toolkit`, not by hand-rolling cache logic per feature. A feature that wants its simple CRUD mutations to survive an app restart while offline also owns a `registerMutationDefaults.ts` (or similarly named) file — see Offline Support.

Typical contents include:

- API
- Components
- Constants
- Hooks
- Providers
- Stores
- Screens
- Types

Not every feature requires every folder.

---

# Routing

Expo Router is responsible only for navigation.

Route files should remain extremely small.

Example:

```tsx
import { LoginScreen } from "@/features/auth";

export default LoginScreen;
```

Business logic should never live inside the `app/` directory.

---

# Responsibilities

## app/

Responsible for:

- Navigation
- Routing
- Layouts
- Route groups

---

## features/

Responsible for:

- Business logic
- Feature UI
- Feature state
- Feature API
- Feature providers

Each feature should be independently maintainable. A feature composes generic packages (`@todo/ui`, `@todo/query-toolkit`, `@todo/design-system`) rather than reimplementing list rendering, pagination, optimistic-cache logic, or mutation-resumability itself.

---

## providers/

Responsible for global application providers.

Current:

- AppProvider
- QueryProvider — wires query cache persistence, the online/offline connectivity manager, and calls each feature's mutation-defaults registration (e.g. `registerTaskMutationDefaults`) synchronously at module scope, before the persisted cache finishes rehydrating

Future examples:

- ThemeProvider
- GestureProvider
- SafeAreaProvider

---

## config/

Application-level feature toggles — e.g. `FEATURES` (pagination mode, infinite scroll on/off, drag-sort on/off, page size). Acts as the default configuration a screen falls back to; individual components can still override behavior per-instance via props on `@todo/ui`'s `List`.

---

## lib/

Contains application-wide infrastructure shared across multiple features.

Current:

- Supabase client

Libraries should remain generic and contain no business logic.

---

## packages/

Reusable workspace packages shared across projects.

Current packages:

- auth
- design-system — Tamagui-based components, including shared `EmptyState` / `ErrorState` / `Loading`
- env
- query-toolkit — generic, non-visual optimistic-cache and infinite/paged-cache helpers for TanStack Query, the online-manager connectivity setup, and `registerListMutationDefaults` for restart-resumable offline mutations. No dependency on any entity type or UI framework.
- styling
- supabase
- types
- ui — generic, Tamagui-free UI primitives: `List` (virtualized, supports `pagination="none" | "infiniteScroll" | "paged"` and optional `dragSort`), `SortableList`, `AsyncList`, `PaginationToolbar`

Packages should remain generic and reusable — no feature-specific vocabulary (e.g. no `Task` type) belongs inside `packages/`.

---

# Dependency Rules

Application flow:

```text
Expo Router
      │
      ▼
Feature Screen
      │
      ▼
Feature Components  ───►  @todo/ui (List / SortableList / AsyncList)
      │
      ▼
Feature Hooks  ───►  @todo/query-toolkit (optimistic cache + mutation-resumability helpers)
      │
      ▼
Feature API
      │
      ▼
Supabase Client
```

Global providers:

```text
App
 │
 ├── Query Provider (cache persistence, online manager, mutation-defaults registration)
 ├── Auth Provider
 └── Design System
```

---

# Architectural Rules

## Features

A feature owns:

- API
- Components
- Hooks
- Stores
- Types
- Providers
- Business logic

A feature should not depend on another feature's internal files.

Communication between features should happen only through public APIs.

A feature's mutation hooks should be built on `@todo/query-toolkit`'s generic optimistic-mutation helpers rather than duplicating cache read/write/rollback logic per feature. Simple CRUD mutations (create/update/delete) should register a `mutationKey` and call `registerListMutationDefaults` so they can resume after an app restart while offline; mutations that depend on live, ephemeral UI state at call time (e.g. a reorder mutation branching on which pagination mode is active) may not be able to fully support this — see Offline Support for the accepted limitation.

---

## Routing

Expo Router owns routing only.

Business logic belongs inside features.

---

## State Management

### TanStack Query

Used for:

- Server state
- Remote caching (persisted to disk for offline read access)
- Background refetching
- Optimistic mutations, paused automatically while offline and resumed on reconnect within the same app session, and — for mutations registered via `registerListMutationDefaults` — resumable even after a full app restart
- Cache invalidation

### Zustand

Used for:

- UI state (filters, sort mode, current page/page size)
- Local state
- Temporary application state

Server data should not be duplicated inside Zustand.

---

# Data Flow

```text
Screen
    │
    ▼
Feature Hook (useXPaged / useXInfinite / useCreateX / ...)
    │
    ▼
TanStack Query  ◄──►  Persisted cache (offline reads)
    │                 Persisted mutation queue (offline writes, restart-resumable)
    ▼
Feature API
    │
    ▼
Supabase
```

Screens should never communicate directly with Supabase.

---

# Lists, Pagination & Drag-and-Drop

List rendering is generalized in `@todo/ui` and configured per screen, not hardcoded per feature:

- **Pagination modes** — `none` (fetch everything), `infiniteScroll` (cursor/keyset-based, safe under concurrent reordering), `paged` (offset-based, supports a numbered toolbar with jump-to-page, at the accepted cost of reduced correctness guarantees under concurrent drag-reordering across page boundaries).
- **Virtualization** — `List` is virtualized on both platforms (`@tanstack/react-virtual` on web, tuned `FlatList` on native) and is the intended component for large or unbounded datasets.
- **Drag-to-reorder** — `SortableList`, intentionally _not_ virtualized. Manual reordering is a bounded, human-curated interaction (dozens–low hundreds of items) by nature; combining it with virtualization was evaluated and deliberately deferred, not overlooked.
- Both pagination and drag-sort are independent, per-instance opt-in props on `List` — a screen can combine them freely (e.g. a small drag-sortable, unpaginated list; a large paginated, non-sortable list).

---

# Database

Database schema is managed entirely through SQL migrations.
supabase/
migrations/

Every schema change must be made through a migration.

Generated database types should always stay synchronized with the database schema.

Manual-ordering columns (e.g. a task's `sort_order`) use fractional values with a single-row "move" RPC, rather than a dense integer column with a full-list reorder RPC — this keeps reordering correct and cheap even when the client only holds a partial (paginated) view of the full list, and tolerates references to neighbors that may have been deleted or changed by the time a queued offline mutation is replayed.

---

# Authentication

Authentication responsibilities include:

- Session management
- Login
- Registration
- Logout
- Protected routes

Future providers:

- Google
- Apple
- GitHub (optional)

---

# Offline Support

Current scope:

- **Reads** — the TanStack Query cache is persisted to disk (`AsyncStorage`/`localStorage`) and rehydrated on launch, so the app opens with last-known data even without a network connection.
- **Writes, same session** — mutations use TanStack Query's default network handling: optimistic updates apply instantly regardless of connectivity, and the underlying network call is paused while offline and resumed automatically, in order, once connectivity returns (verified via a real connectivity signal, not just an assumed online state).
- **Writes, across app restarts** — simple CRUD mutations (create/update/delete) register their implementation globally on the `QueryClient` via `registerListMutationDefaults`, keyed by a stable `mutationKey`, rather than only existing as a per-hook closure. This lets `resumePausedMutations()` replay a mutation that was queued and paused before the app was killed, once it restarts and reconnects — not just while the original component stays mounted. Verified end-to-end on web (offline create/move, tab close, reopen, reconnect, confirmed server-side)

Accepted, deliberate limitations:

- A resumed mutation's failure path cannot restore the exact prior optimistic snapshot (that rollback context isn't serializable) — on failure, the cache is reconciled by invalidating and refetching real server state instead of a precise rollback.
- The task-move/reorder mutation is hand-written rather than built on the generic factory, because it branches on live UI state (which pagination mode and page the user is on) at call time. Registering a resumable default for it only covers the infinite-scroll cache path; a move made in paged mode does not get full optimistic re-application on resume after a restart (the read cache still reflects the pre-kill state via read persistence, so the user doesn't lose their view of the change — it just isn't replayed with the same optimistic-write fidelity).
- Multi-device conflict resolution beyond last-write-wins is not implemented.

Lesson learned while building this: input components that gate on a mutation's `isPending` (disable the field, clear it only after `await`) work fine online but break under `networkMode: "online"` while offline, since a paused mutation stays "pending" for the entire offline duration — not just a brief in-flight window. `AddTaskForm` originally did this; fixed by clearing input state synchronously on submit and using fire-and-forget `mutate` instead of `mutateAsync` + `await`, so multiple offline submissions can queue freely. Worth checking any future form built the same way (disable-while-pending, clear-after-await) against this same failure mode
---

# Feature Lifecycle

When creating a new feature:

1. Create a folder under `src/features`.
2. Add only the folders the feature actually needs.
3. Keep all business logic inside the feature; build list UI on `@todo/ui` and mutation hooks on `@todo/query-toolkit` rather than reimplementing either.
4. If the feature has simple CRUD mutations that should survive an offline app restart, define mutation keys and a `register<Feature>MutationDefaults` function calling `@todo/query-toolkit`'s `registerListMutationDefaults`, and call it from `QueryProvider` at module scope.
5. Export the feature's public API through `index.ts`.
6. Keep route files as thin wrappers.

Removing a feature should primarily involve deleting its folder and removing its routes.

---

# Current Status

Completed:

- Monorepo
- Expo
- Expo Router
- TypeScript
- Supabase
- Database migrations
- Generated database types
- Row Level Security
- Email authentication
- Protected routing
- Feature-first architecture
- TanStack Query
- Zustand
- Project setup automation
- Task CRUD
- Task filters
- Optimistic updates
- Drag-to-reorder (manual sort), extracted into `@todo/ui`
- Pagination: infinite scroll (cursor-based) and paged toolbar (offset-based), configurable per instance
- Virtualized list rendering for large datasets
- Generic optimistic-cache mutation helpers (`@todo/query-toolkit`)
- Shared UI components (`@todo/design-system`: `EmptyState`, `ErrorState`, `Loading`)
- Offline read support (persisted query cache) and same-session offline mutation retry on reconnect
- Unit tests for @todo/query-toolkit and @todo/ui pagination logic
- CI: automated formatting, typecheck, and test checks on every push/PR
- Restart-resumable offline mutation queue for simple CRUD (implemented and verified end-to-end)

Upcoming:

- Extend the restart-resumable mutation pattern to any future entity beyond tasks
- Multi-device conflict resolution (including concurrent reorder across devices)
- Google Sign-In
- Apple Sign-In
- Component/hook-level testing for apps/app (React Testing Library, mocked Supabase)
- CD: automated builds/deploys via EAS (requires Expo account + EXPO_TOKEN secret)
