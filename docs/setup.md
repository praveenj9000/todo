# Setup Guide

This guide explains how to set up the project on a new machine.

## Prerequisites

Install the following before getting started:

* Node.js 24 or newer
* pnpm 11 or newer
* Git

Verify the installation:

```bash
node --version
pnpm --version
git --version
```

## Clone the Repository

```bash
git clone <repository-url>
cd todo
```

## Configure Environment Variables

Create a `.env` file in the project root.

```env
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-supabase-publishable-key>
```

The root `.env` file is the single source of truth.

Do **not** edit `apps/app/.env` manually. It is automatically generated from the root `.env`.

## Install and Verify the Project

Run:

```bash
pnpm setup
```

The setup script will:

* Verify Node.js
* Verify pnpm
* Install dependencies (if needed)
* Sync environment variables
* Verify the Supabase CLI is available
* Run a TypeScript type check

If everything succeeds, the project is ready to run.

## Start Development

```bash
pnpm dev
```

This command automatically syncs the environment before starting the Expo development server.

## Useful Commands

### Development

```bash
pnpm dev
```

Starts the Expo development server.

### Build

```bash
pnpm build
```

Builds every workspace package.

### Type Checking

```bash
pnpm typecheck
```

Runs TypeScript across the entire monorepo.

### Sync Environment Variables

```bash
pnpm sync-env
```

Copies the root `.env` into the Expo application.

Normally you do not need to run this manually because it is executed automatically by `pnpm setup` and `pnpm dev`.

## Project Structure

```text
apps/
  app/                Expo application

packages/
  auth/
  design-system/
  env/
  styling/
  supabase/
  types/
  ui/

scripts/
  setup.mjs
  sync-env.mjs

supabase/
  config.toml
  migrations/
```

## Troubleshooting

### Environment variables are not available

Run:

```bash
pnpm sync-env
```

Restart the Expo development server afterward.

### TypeScript errors

Run:

```bash
pnpm typecheck
```

Resolve all reported errors before committing changes.

### Dependency issues

Delete `node_modules` and reinstall:

```bash
pnpm install
```

### Supabase CLI unavailable

The project uses the Supabase CLI through `pnpm dlx`, so a global installation is not required.

Verify it is available:

```bash
pnpm dlx supabase --version
```

## Additional Documentation

* `docs/supabase.md` — Database migrations and Supabase workflow.
* `docs/architecture.md` — Project architecture (to be added).
