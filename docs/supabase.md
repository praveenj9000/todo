# Supabase Guide

This project manages the database using **Supabase Migrations**.

The repository is the **single source of truth** for the database schema.

Do **not** make schema changes directly from the Supabase Dashboard unless absolutely necessary.

---

# Initial Project Setup

Authenticate with Supabase:

```bash
pnpm db:login
```

Link the repository to the desired Supabase project:

```bash
pnpm db:link
```

Generate database types:

```bash
pnpm db:types
```

---

# Migration Workflow

Every database change should follow this process.

## 1. Create a Migration

```bash
pnpm db:new add_due_date
```

A new SQL migration will be created inside:

```text
supabase/migrations/
```

> **Note:** Pass only the name — do not include a `.sql` extension. `pnpm db:new` strips a trailing `.sql` automatically if you include one and validates the name before creating the file, so this can't produce a `.sql.sql` file even by mistake.

## 2. Edit the Migration

Write all schema changes inside the generated SQL file.

Examples:

- Create tables
- Alter tables
- Create indexes
- Enable Row Level Security
- Create policies
- Create triggers
- Create functions

Never edit previously applied migration files.

## 3. Apply the Migration

```bash
pnpm db:push
```

This applies every pending migration to the linked Supabase project (the one currently linked — see `pnpm db:link:prod` / `pnpm db:link:e2e` below if you're working with more than one project).

## 4. Verify the Migration Applied

`pnpm db:push` reporting success only confirms the CLI ran without error — it does not, by itself, prove a specific migration's content is what you expect. To check:

```bash
pnpm dlx supabase migration list
```

This compares local migration files against what the remote project has recorded as applied, by timestamp. If you need to confirm the actual applied SQL (e.g. a function body), query it directly via the Supabase SQL Editor or `psql`:

```sql
select prosrc from pg_proc where proname = 'your_function_name';
```

## 5. Generate Database Types

```bash
pnpm db:types
```

This updates:

```text
packages/types/src/database.ts
```

The generated file should never be edited manually.

## 6. Apply the Same Migration to the E2E Project

If this repo has an E2E test database set up (see below), apply the same migration there too — otherwise the two schemas drift apart and E2E tests may pass or fail against outdated assumptions:

```bash
pnpm db:push:e2e
```

## 7. Commit

Commit the migration together with the generated database types.

Example:

```text
feat(db): add due_date to tasks
```

---

# Creating a New Supabase Project

If the current Supabase project is replaced:

## 1. Create the new project

Create a new Supabase project from the dashboard.

## 2. Update Environment Variables

Update the root `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Sync the environment:

```bash
pnpm sync-env
```

## 3. Link the Repository

```bash
pnpm db:link
```

Select the new project.

## 4. Apply All Migrations

```bash
pnpm db:push
```

This recreates the entire database schema from the migration history.

## 5. Generate Types

```bash
pnpm db:types
```

The project is now fully configured against the new database.

---

# Existing Database

To continue development on an existing linked project:

```bash
pnpm db:push
pnpm db:types
```

No additional setup is required.

---

# Useful Commands

| Command                   | Description                                                                                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm db:login`           | Authenticate the Supabase CLI.                                                                                                                           |
| `pnpm db:link`            | Link the repository to a Supabase project.                                                                                                               |
| `pnpm db:new <name>`      | Create a new migration. Automatically strips a trailing `.sql` if you include one, and validates the name.                                               |
| `pnpm db:push`            | Apply pending migrations to whichever project is currently linked.                                                                                       |
| `pnpm db:pull`            | Pull the remote schema into local migrations (rarely needed).                                                                                            |
| `pnpm db:types`           | Generate TypeScript database types.                                                                                                                      |
| `pnpm db:reset`           | Reset the linked database. See Supabase CLI docs for local-dev usage (`supabase start`), which is not otherwise part of this repo's documented workflow. |
| `supabase migration list` | Compare local migration files against what's applied remotely.                                                                                           |
| `pnpm db:link:prod`       | Link the CLI to the main project (reads `PROD_PROJECT_REF` from `.env`).                                                                                 |
| `pnpm db:link:e2e`        | Link the CLI to the E2E project (reads `E2E_PROJECT_REF` from `.env.e2e`).                                                                               |
| `pnpm db:push:e2e`        | Push and verify pending migrations against the E2E project, then relink to prod automatically.                                                           |

---

# Best Practices

- Treat migrations as the source of truth.
- Create a new migration for every schema change.
- Never modify an applied migration.
- After `db:push`, verify the migration actually applied — don't rely on the command's success alone.
- Generate database types after every migration.
- If an E2E test database exists (see below), apply every new migration there too, via `pnpm db:push:e2e` — don't let it silently drift from the main project's schema.
- Commit migrations and generated types together.
- Avoid making schema changes directly in the Supabase Dashboard.
- Keep all schema history in Git.

Following these practices ensures every developer can recreate the database from the repository alone.

---

# E2E Test Database

A separate Supabase project (`todo-e2e`) mirrors the schema of the main
project, used only by the Playwright E2E suite — never touches production
data. See `docs/setup.md`'s "E2E Testing Setup" section for one-time
project creation and `.env.e2e` configuration.

## Applying a New Migration to Both Projects

Every migration must be applied to the main project **and** the E2E
project, so they don't drift apart. After the normal migration workflow
above (`pnpm db:push` against the main project):

```bash
pnpm db:push:e2e
```

This links to the E2E project, pushes pending migrations, verifies them,
and relinks back to the main project automatically — including on failure,
so the CLI is never left pointed at the wrong project by accident.

If a step fails, the script prints the four underlying commands to run
manually for debugging:

```bash
pnpm db:link:e2e
pnpm dlx supabase db push
pnpm verify-migration
pnpm db:link:prod
```

## Related Commands

See the Useful Commands table above — `db:link:prod`, `db:link:e2e`, and `db:push:e2e` are listed there alongside the rest of the CLI commands, rather than duplicated in a second table here.
