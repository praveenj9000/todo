# Todo Application Architecture

## Overview

This repository is the foundation for a production-ready cross-platform application built with Expo, React Native, TypeScript, Supabase, and Turborepo.

The architecture is designed around independent features that own their own business logic, making new functionality easy to add, remove, and maintain without affecting the rest of the application.

The long-term goal is to support multiple applications using the same architectural principles while keeping the codebase clean, scalable, and easy to understand.

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

## Client State

- Zustand

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

features/
providers/
lib/
utils/
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

A feature should contain everything related to that feature.

Typical contents include:

- API
- Components
- Hooks
- Providers
- Stores
- Screens
- Types
- Utilities

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

Each feature should be independently maintainable.

---

## providers/

Responsible for global application providers.

Current:

- AppProvider
- QueryProvider

Future examples:

- ThemeProvider
- GestureProvider
- SafeAreaProvider

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
- design-system
- env
- styling
- supabase
- types
- ui

Packages should remain generic and reusable.

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
Feature Components
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
 ├── Query Provider
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

---

## Routing

Expo Router owns routing only.

Business logic belongs inside features.

---

## State Management

### TanStack Query

Used for:

- Server state
- Remote caching
- Background refetching
- Mutations
- Cache invalidation

### Zustand

Used for:

- UI state
- Local state
- Temporary application state

Server data should not be duplicated inside Zustand.

---

# Data Flow

```text
Screen
    │
    ▼
Feature Hook
    │
    ▼
TanStack Query
    │
    ▼
Feature API
    │
    ▼
Supabase
```

Screens should never communicate directly with Supabase.

---

# Database

Database schema is managed entirely through SQL migrations.

```
supabase/
    migrations/
```

Every schema change must be made through a migration.

Generated database types should always stay synchronized with the database schema.

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

# Feature Lifecycle

When creating a new feature:

1. Create a folder under `src/features`.
2. Add only the folders the feature actually needs.
3. Keep all business logic inside the feature.
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

Upcoming:

- Task CRUD
- Task filters
- Optimistic updates
- Realtime synchronization
- Offline support
- Shared UI components
- Google Sign-In
- Apple Sign-In
- Testing
- CI/CD