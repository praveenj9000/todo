# Todo Application Architecture

## Overview

This project is a production-quality cross-platform Todo application designed to run on:

- Android
- iOS
- Web/Desktop

The application is built using a monorepo architecture to maximize code sharing while keeping business logic modular and maintainable.

The goal is to build a scalable application that remains simple to maintain, minimizes hosting costs, and provides a native user experience across all platforms.

---

# Core Principles

- Production-first architecture
- Feature-based organization
- Shared UI and business logic
- Strong TypeScript typing
- Offline-first architecture (planned)
- Automatic synchronization
- Low operational cost
- Minimal code duplication
- Clear package boundaries
- No circular dependencies

---

# Technology Stack

## Frontend

- React Native
- Expo
- Expo Router
- TypeScript

## UI Layer

- @todo/styling (styling abstraction)
- @todo/design-system (tokens, themes, fonts)
- Tamagui (implementation detail)

## Backend

- Supabase
- PostgreSQL
- Supabase Auth using publishable client keys
- Client applications use Supabase publishable keys.
- Secret keys are never exposed to mobile/web applications.
- Supabase Realtime

## State Management

- TanStack Query
- Zustand

## Validation

- React Hook Form
- Zod

## Monorepo

- pnpm Workspaces
- Turborepo

---

# Repository Structure

```
todo/

apps/
packages/
docs/
supabase/

packages/
    app-provider/
    assets/
    auth/
    config/
    design-system/
    env/
    forms/
    icons/
    styling/
    supabase/
    tasks/
    types/
    ui/
```

---

# Package Responsibilities

## @todo/styling

Responsible for the styling abstraction layer.

Responsibilities:

- Wraps the underlying styling library
- Exposes stable UI primitives
- Consumes design-system tokens
- Shields the rest of the application from implementation details

Only this package knows that Tamagui is used.

## @todo/forms

Responsible for shared form infrastructure.

Responsibilities:

- React Hook Form utilities
- Zod integration
- Shared form hooks
- Validation helpers

## @todo/env

Responsible for reading and validating environment variables.

Responsibilities:

- Type-safe environment access
- Runtime validation

## @todo/icons

Shared icon exports.

This package isolates icon libraries from the rest of the application.

## @todo/assets

Shared application assets.

Examples:

- Images
- SVGs
- Fonts

## @todo/config

Shared configuration used across packages.

## @todo/design-system

Responsible for:

- Tamagui configuration
- Design tokens
- Themes
- Fonts
- Design system provider

This package contains **design infrastructure only**.

---

## @todo/ui

Responsible for reusable application UI components.

Responsibilities:

- Layout components
- Form components
- Feedback components
- Display components

This package builds upon @todo/styling.

---

## @todo/app-provider

Responsible for composing global providers.

Current responsibilities:

- Design system provider

Future responsibilities:

- Query Client Provider
- Supabase Provider
- Theme Provider
- Gesture Handler
- Safe Area Provider

---

## @todo/auth

Responsible for the authentication feature.

Planned contents:

- Components
- Hooks
- Providers
- Services
- Validation
- Types

---

## @todo/tasks

Responsible for task management.

Planned contents:

- Hooks
- Services
- Validation
- Types
- Offline synchronization
- Realtime synchronization

---

## @todo/supabase

Responsible for:

- Supabase client
- Authentication helpers
- Database access
- Generated database types

---

## @todo/types

Shared TypeScript types.

---

# Dependency Rules

Dependency flow:

```
apps
    ↓
ui
    ↓
styling
    ↓
design-system
    ↓
Tamagui
```

Business features:

```
apps
│
├── auth
├── tasks
│
├──────────────┐
│              │
▼              ▼
ui         supabase
│              │
└──────┬───────┘
       ▼
   styling
       ▼
design-system
       ▼
   Tamagui
```

Rules:

- Apps should not import Tamagui directly.
- Feature packages should use @todo/ui.
- Design system should not contain business logic.
- UI should not contain business logic.
- Business logic belongs inside feature packages.
- Avoid circular dependencies.

---
# Architectural Rules

- Apps own navigation.
- Apps own routing.
- Apps compose features.
- Feature packages never import from apps.
- UI components never contain business logic.
- Styling components never contain business logic.
- Design-system contains tokens only.
- Only @todo/styling may depend on Tamagui.
- UI components consume @todo/styling.
- Business logic communicates with Supabase only through services.

# UI Architecture

Current:

- Screen
- Text

Planned:

- Button
- TextField
- Card
- Loading
- EmptyState
- Avatar
- Dialog
- Bottom Sheet

UI components should expose a stable API while hiding implementation details.

---

# Authentication Architecture (Planned)

Flow:

Application Start

↓

Restore Session

↓

Authenticated?

├── Yes → Protected Routes
└── No → Public Routes

Authentication providers:

- Email/Password
- Google
- Apple
- GitHub (optional)

---

# Data Layer (Planned)

Supabase
        ↓
@todo/supabase
        ↓
Feature Service
        ↓
TanStack Query
        ↓
UI

The UI should never communicate directly with Supabase.

---

# Offline Strategy (Planned)

- Local cache
- Optimistic updates
- Automatic synchronization
- Conflict resolution
- Background synchronization

---

# Security

Planned:

- Supabase Authentication
- Row-Level Security
- Secure session storage
- Input validation
- Server-side authorization

---

# Current Status

Completed:

- Monorepo
- pnpm Workspaces
- Turborepo
- Expo
- Expo Router
- Supabase project
- Database migrations
- Row-Level Security
- Design System
- Styling abstraction
- UI component library (foundation)
- Forms package
- Authentication package (foundation)
- Environment package
- Shared types
- App provider

In Progress:

- Authentication UI
- Authentication flows

Upcoming:

- Google Sign-In
- Apple Sign-In
- Task management
- Realtime synchronization
- Offline support
- TanStack Query integration
- Testing
- CI/CD