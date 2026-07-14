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
- Tamagui

## Backend

- Supabase
- PostgreSQL
- Supabase Auth
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
```

---

# Package Responsibilities

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

Responsible for:

- UI primitives
- Reusable components
- Layout components

Examples:

- Screen
- Text
- Button
- Card
- TextField

Feature packages should import UI from this package.

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
- Services
- Schemas
- Types
- Screens

---

## @todo/tasks

Responsible for task management.

Planned contents:

- Components
- Services
- Hooks
- Schemas
- Types
- Offline synchronization

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
design-system
```

Business features:

```
apps
      ↓
auth
tasks
      ↓
ui
      ↓
design-system
```

Rules:

- Apps should not import Tamagui directly.
- Feature packages should use @todo/ui.
- Design system should not contain business logic.
- UI should not contain business logic.
- Business logic belongs inside feature packages.
- Avoid circular dependencies.

---

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

Repository Layer

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
- Turbo
- pnpm Workspace
- Expo
- Expo Router
- Design System
- UI package
- App Provider
- Initial UI primitives

In Progress:

- Backend integration

Upcoming:

- Supabase
- Authentication
- Database
- Tasks
- Offline synchronization