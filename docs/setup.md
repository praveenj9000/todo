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

### Linting

```bash
pnpm lint
```

Runs ESLint across the repo. Included in the pre-commit hook alongside formatting, typecheck, and tests.

### Testing

```bash
pnpm test
```

Runs Vitest across every workspace package that has a `test` script, via Turborepo. A pre-commit hook runs formatting, typecheck, and the full test suite automatically before every commit — Turborepo's cache keeps repeat runs fast.

Currently covered:

- `@todo/query-toolkit` — optimistic cache logic (pure, no DOM)
- `@todo/ui` — pagination math (`getPageNumbers`, pure, no DOM)
- `apps/app` — component behavior (jsdom + React Testing Library) and mutation hooks (`renderHook`, mocked API layer, real cache logic) for tasks and auth

**Not yet covered:** `SortableList`, `List`, `AsyncList` — these depend on `react-native-draggable-flatlist`, `@dnd-kit`, and `@tanstack/react-virtual`, which need real browser layout APIs jsdom doesn't reliably provide. See `docs/testing-notes.md`.

### E2E Testing Setup (one-time, per developer)

E2E tests (Playwright) run against a dedicated Supabase project, never
against production data.

1. Create a separate Supabase project named `todo-e2e`.
2. Create one fixed test user in it (Dashboard → Authentication → Users →
   Add User — skip email confirmation).
3. Create `.env.e2e` in the repo root (gitignored) with:

```env
EXPO_PUBLIC_SUPABASE_URL=<e2e project URL>
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<e2e project anon key>
E2E_TEST_USER_EMAIL=<test user email>
E2E_TEST_USER_PASSWORD=<test user password>
E2E_PROJECT_REF=<e2e project ref>
```

4. Add `PROD_PROJECT_REF=<main project ref>` to the existing root `.env`
   if it isn't already there.
5. Install the Playwright browser binary (one-time, per machine):

```bash
pnpm --filter @todo/app exec playwright install chromium
```

6. Push the schema to the new project:

```bash
pnpm db:push:e2e
```

7. Run the suite:

```bash
pnpm test:e2e
```

See `docs/supabase.md` for keeping the E2E project's schema in sync going
forward, and `docs/testing-notes.md` for E2E scope and known gaps.

### Local E2E Testing (recommended for day-to-day use)

Running E2E tests against the hosted `todo-e2e` Supabase project (see
above) works but can be unreliable under repeated runs — free-tier
connection-pool limits and cold starts cause intermittent, non-code-related
failures. Running Supabase locally via Docker eliminates this entirely and
is the recommended default for local iteration; the hosted project setup
above remains useful for testing against a real network/paid-tier backend
later.

**Prerequisite: Docker Desktop.**

- **Windows**: https://www.docker.com/products/docker-desktop/ — install,
  keep WSL 2 selected, reboot, launch once and accept the license terms.
- **macOS**: https://www.docker.com/products/docker-desktop/ — install,
  launch once, accept the license terms.
- **Linux**: https://docs.docker.com/engine/install/ — install Docker
  Engine, add your user to the `docker` group.

Verify: `docker info` should print without error.

**One-time (or after a reboot) setup:**

```bash
pnpm test:e2e:local:setup
```

This starts a full local Supabase stack (Postgres, Auth, REST, Realtime)
in Docker, applies every migration automatically, creates a local test
user, and writes `.env.e2e.local` (gitignored) with the connection details.

**Run the suite:**

```bash
pnpm test:e2e:local
```

The local Supabase stack keeps running between test runs — no need to
repeat the setup step each time, only after a reboot or an explicit
`pnpm dlx supabase stop`.

**Stopping the local stack** (frees Docker resources when you're done):

```bash
pnpm dlx supabase stop
```

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

## Continuous Integration

Every push and pull request against `main` runs `.github/workflows/ci.yml`, which checks:

- Formatting (`pnpm format:check`)
- TypeScript (`pnpm typecheck`)
- Tests (`pnpm test`)

CI does not require any GitHub Secrets — it writes placeholder values for `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` since none of the CI checks make real Supabase calls. E2E tests are not yet wired into CI — see `docs/testing-notes.md`.

To make these checks required before merging, enable branch protection on `main` in the repository settings and require the `ci` status check to pass.

Continuous Deployment (building and publishing the app via EAS) is not yet configured — see `docs/architecture.md`'s Upcoming section.

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

### "Unable to resolve" after installing/updating workspace dependencies

When `pnpm install` adds or removes packages that live inside a workspace
package's own `node_modules` (e.g. `@todo/design-system`'s `@tamagui/*`
dependencies), Metro's cached file map can become stale: the new symlinks/
junctions exist on disk, yet Metro reports `Unable to resolve "<package>"
from "packages/design-system/src/..."`. The package is there — Metro just
cached a crawl from before the install.

Try, in order — stop as soon as one works:

```bash
pnpm --filter @todo/app exec expo start --clear
```

If that alone doesn't fix it (this has happened on Windows in this repo),
Metro/Haste caches outside the project directory are the likely reason —
clear those too, per Expo's own Windows troubleshooting guidance:

```powershell
rm -rf node_modules
pnpm install
watchman watch-del-all
del $env:LOCALAPPDATA\Temp\haste-map-*
del $env:LOCALAPPDATA\Temp\metro-cache
pnpm --filter @todo/app exec expo start --clear
```

(`watchman` is optional if you don't have it installed — skip that line if
the command isn't found.)

**Not fully confirmed as root cause:** this class of symptom was diagnosed
during real debugging where several other changes (`.npmrc` linker mode,
Windows Developer Mode, metro.config.js resolver settings) were also made
around the same time, so it's possible one of those was the actual fix
rather than cache staleness. Try the cache-clear steps above first next
time this happens — they're cheap — before reaching for anything more
invasive.

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

### Playwright browser not found

If `pnpm test:e2e` fails with an error like `Executable doesn't exist at ...chrome-headless-shell...`, the Playwright browser binaries haven't been downloaded yet (installing the `@playwright/test` npm package does not do this automatically). Run:

```bash
pnpm --filter @todo/app exec playwright install chromium
```

### E2E web server times out

`expo start --web` can take over a minute on a cold Metro bundle (especially with Tamagui's babel plugin). If `pnpm test:e2e` times out waiting for the dev server, this is expected on a cold start — `playwright.config.ts`'s `webServer.timeout` is set to accommodate it. For faster local iteration, start the dev server manually in one terminal (`pnpm --filter @todo/app exec expo start --web`) and run `pnpm test:e2e` in another — Playwright reuses the already-running server outside of CI.

## Additional Documentation

- `docs/supabase.md` — Database migrations and Supabase workflow.
- `docs/architecture.md` — Project architecture.
- `docs/testing-notes.md` — Test coverage status, known gaps, and E2E scope.
