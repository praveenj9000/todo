# Todo

A cross-platform Todo application built with **Expo**, **React Native**, **Expo Router**, **Tamagui**, **Supabase**, **Turbo**, and **pnpm workspaces**.

## Requirements

* Node.js 24+
* pnpm 11+
* Git

## Getting Started

Clone the repository:

```bash
git clone <repository-url>
cd todo
```

Create a `.env` file in the project root (or copy `.env.example`) and add your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

Run the project setup:

```bash
pnpm setup
```

Start the development server:

```bash
pnpm dev
```

## Available Scripts

| Command          | Description                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `pnpm setup`     | Installs dependencies, syncs environment files, checks the development environment, and runs type checking. |
| `pnpm dev`       | Starts the Expo development server.                                                                         |
| `pnpm build`     | Builds all workspace packages.                                                                              |
| `pnpm typecheck` | Runs TypeScript type checking across the monorepo.                                                          |
| `pnpm sync-env`  | Copies the root `.env` into the Expo app.                                                                   |

### Supabase

| Command              | Description                                                      |
| -------------------- | ---------------------------------------------------------------- |
| `pnpm db:login`      | Authenticate the Supabase CLI.                                   |
| `pnpm db:link`       | Link this repository to a Supabase project.                      |
| `pnpm db:new <name>` | Create a new database migration.                                 |
| `pnpm db:push`       | Apply local migrations to the linked project.                    |
| `pnpm db:pull`       | Pull schema changes from the linked project.                     |
| `pnpm db:reset`      | Reset the local database (when using a local Supabase instance). |
| `pnpm db:types`      | Generate TypeScript database types.                              |

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
  migrations/
```

## Documentation

Additional documentation will be added over time.

* `architecture.md` — Application architecture and design decisions.
* Database migrations are stored in `supabase/migrations`.
