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

> **Note:** Pass only the name — do not include a `.sql` extension. `supabase migration new` appends `.sql` automatically; including it yourself produces a file ending in `.sql.sql`.

## 2. Edit the Migration

Write all schema changes inside the generated SQL file.

Examples:

* Create tables
* Alter tables
* Create indexes
* Enable Row Level Security
* Create policies
* Create triggers
* Create functions

Never edit previously applied migration files.

## 3. Apply the Migration

```bash
pnpm db:push
```

This applies every pending migration to the linked Supabase project.

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

## 6. Commit

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

| Command                      | Description                                                      |
| ---------------------------- | ---------------------------------------------------------------- |
| `pnpm db:login`              | Authenticate the Supabase CLI.                                   |
| `pnpm db:link`               | Link the repository to a Supabase project.                       |
| `pnpm db:new <name>`         | Create a new migration. Automatically strips a trailing `.sql` if you include one, and validates the name.  |
| `pnpm db:push`               | Apply pending migrations.                                        |
| `pnpm db:pull`               | Pull the remote schema into local migrations (rarely needed).    |
| `pnpm db:types`              | Generate TypeScript database types.                              |
| `pnpm db:reset`              | Reset the linked database. See Supabase CLI docs for local-dev usage (`supabase start`), which is not otherwise part of this repo's documented workflow. |
| `supabase migration list`    | Compare local migration files against what's applied remotely.   |

---

# Best Practices

* Treat migrations as the source of truth.
* Create a new migration for every schema change.
* Never modify an applied migration.
* After `db:push`, verify the migration actually applied — don't rely on the command's success alone.
* Generate database types after every migration.
* Commit migrations and generated types together.
* Avoid making schema changes directly in the Supabase Dashboard.
* Keep all schema history in Git.

Following these practices ensures every developer can recreate the database from the repository alone.