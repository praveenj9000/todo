# Todo Application Architecture

## Overview

This repository is the foundation for a production-ready cross-platform application built with Expo, React Native, TypeScript, Supabase, and Turborepo.

The architecture is designed around independent features that own their own business logic, making new functionality easy to add, remove, and maintain without affecting the rest of the application.

The long-term goal is to support multiple applications using the same architectural principles while keeping the codebase clean, scalable, and easy to understand. Several pieces of this repo — list rendering, pagination, drag-to-reorder, virtualization, optimistic cache management — were deliberately built as generic, reusable packages rather than task-specific code, so future projects (e.g. an e-commerce or admin product) can reuse them directly.

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
  - `onlineManager` wired to real device connectivity (`NetInfo` on native, browser events on web)

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
    index.ts

settings/
    api/
    components/
    screens/
    index.ts
```

A feature should contain everything related to that feature — including its own optimistic-mutation hooks, built on top of the generic primitives in `@todo/query-toolkit`, not by hand-rolling cache logic per feature.

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

Each feature should be independently maintainable. A feature composes generic packages (`@todo/ui`, `@todo/query-toolkit`, `@todo/design-system`) rather than reimplementing list rendering, pagination, or optimistic-cache logic itself.

---

## providers/

Responsible for global application providers.

Current:

- AppProvider
- QueryProvider (also wires query cache persistence and the online/offline connectivity manager)

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
- query-toolkit — generic, non-visual optimistic-cache and infinite/paged-cache helpers for TanStack Query, plus the online-manager connectivity setup. No dependency on any entity type or UI framework.
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
Feature Hooks  ───►  @todo/query-toolkit (optimistic cache helpers)
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
 ├── Query Provider (cache persistence, online manager)
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

A feature's mutation hooks should be built on `@todo/query-toolkit`'s generic optimistic-mutation helpers rather than duplicating cache read/write/rollback logic per feature.

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
- Optimistic mutations, paused automatically while offline and resumed on reconnect
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
    │
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
- **Writes** — mutations use TanStack Query's default network handling: optimistic updates apply instantly regardless of connectivity, and the underlying network call is paused while offline and resumed automatically, in order, once connectivity returns (verified via a real connectivity signal, not just an assumed online state). This covers offline mutations made and resolved within the same app session.

Not yet covered (open follow-up):

- Mutations queued while offline **do not currently survive a full app kill/restart** before reconnecting — persisting and resuming the mutation queue itself (not just the read cache) requires registering mutation functions centrally on the `QueryClient` rather than as per-hook closures, which is a deliberate follow-up scope, not an oversight.
- Multi-device conflict resolution beyond last-write-wins is not implemented.

---

# Feature Lifecycle

When creating a new feature:

1. Create a folder under `src/features`.
2. Add only the folders the feature actually needs.
3. Keep all business logic inside the feature; build list UI on `@todo/ui` and mutation hooks on `@todo/query-toolkit` rather than reimplementing either.
4. Export the feature's public API through `index.ts`.
5. Keep route files as thin wrappers.

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

Upcoming:

- Offline mutation queue surviving app restarts (persisted, resumable mutations)
- Realtime synchronization
- Multi-device conflict resolution
- Google Sign-In
- Apple Sign-In
- Testing
- CI/CD
