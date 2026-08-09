# Setup Guide

This guide explains how to set up the project on a new machine.

## Prerequisites

Install the following before getting started:

- Node.js 24 or newer — verify this against `apps/app/package.json`'s `@types/node` version, which currently suggests a newer major; confirm the actual required runtime version before relying on this number.
- pnpm 11 or newer
- Git

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

- Verify Node.js
- Verify pnpm
- Install dependencies (if needed)
- Sync environment variables
- Verify the Supabase CLI is available
- Run a TypeScript type check

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

## Additional Scripts

### Environment Check

```bash
pnpm check-env
```

Runs a fast environment health check: Node/pnpm versions, `.env` presence and required keys, Supabase CLI availability, and Expo dependency version alignment. Faster than `pnpm setup` — use this when something feels broken and you don't want to re-run the full install/typecheck pipeline.

> Note: `pnpm doctor` is a separate, built-in pnpm command (checks pnpm's own install health — registry connectivity, bin path, etc.), unrelated to this script.

### Scaffold a New Feature

```bash
pnpm new-feature <feature-name>
```

Creates `apps/app/src/features/<feature-name>/` with the standard folder structure (`api/`, `components/`, `constants/`, `hooks/`, `screens/`, `stores/`, `types/`), a stub screen, and an `index.ts` exporting it. Delete any folders the feature doesn't need — see `docs/architecture.md`'s Feature Lifecycle section.

### Verify Migration Status

```bash
pnpm verify-migration
```

Compares local migration files against what the linked Supabase project has recorded as applied. `db:push` reporting success doesn't always mean what you expect it means — use this to confirm local and remote actually agree before trusting a migration landed.

### Formatting

```bash
pnpm format
```

Formats the entire repo with Prettier. Config lives in `.prettierrc.json`.

```bash
pnpm format:check
```

Checks formatting without writing changes — useful in CI.

A pre-commit hook (via Husky + lint-staged) automatically formats staged files with Prettier before each commit — no manual `pnpm format` step needed. If a file gets reformatted, it's re-staged automatically as part of the commit.

## Project Structure

```text
apps/
  app/                Expo application

packages/
  auth/
  design-system/
  env/
  query-toolkit/
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

## Offline Support Notes

The app persists its data cache to disk (`AsyncStorage` on native, `localStorage` on web) and wires real device connectivity detection (`@react-native-community/netinfo` on native, browser events on web). No additional setup or environment variables are required for this — it's active automatically once dependencies are installed. See `docs/architecture.md` for what is and isn't covered by current offline support.

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

### Expo dependency version mismatches

After adding or upgrading a native dependency, check compatibility against the installed Expo SDK version:

```bash
pnpm --filter @todo/app exec expo install --check
```

If it reports outdated packages, avoid the interactive auto-fix prompt inside a pnpm workspace — it can fail with a recursive-exec error. Instead, pin the flagged versions directly:

```bash
pnpm --filter @todo/app add <package>@<expected-version>
```

### Supabase CLI unavailable

The project uses the Supabase CLI through `pnpm dlx`, so a global installation is not required.

Verify it is available:

```bash
pnpm dlx supabase --version
```

## Additional Documentation

- `docs/supabase.md` — Database migrations and Supabase workflow.
- `docs/architecture.md` — Project architecture.

### Testing

```bash
pnpm test
```

Runs Vitest across every workspace package that has a `test` script, via Turborepo.

Currently covered: `@todo/query-toolkit` (optimistic cache logic) and `@todo/ui`'s pagination math (`getPageNumbers`). These are pure-logic tests with no DOM or Supabase mocking required — the highest-risk, most reused code in the repo, tested first.

Component and hook-level testing for `apps/app` (React Testing Library, mocked Supabase client) is a planned follow-up, not yet in place.

## Continuous Integration

Every push and pull request against `main` runs `.github/workflows/ci.yml`, which checks:

- Formatting (`pnpm format:check`)
- TypeScript (`pnpm typecheck`)
- Tests (`pnpm test`)

CI does not require any GitHub Secrets — it writes placeholder values for `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` since none of the CI checks make real Supabase calls.

To make these checks required before merging, enable branch protection on `main` in the repository settings and require the `ci` status check to pass.

Continuous Deployment (building and publishing the app via EAS) is not yet configured — see `docs/architecture.md`'s Upcoming section.
