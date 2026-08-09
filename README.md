# Todo

A cross-platform Todo application built with **Expo**, **React Native**, **Expo Router**, **Tamagui**, **Supabase**, **Turbo**, and **pnpm Workspaces**.

## Quick Start

Clone the repository:

```bash
git clone <repository-url>
cd todo
```

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-supabase-publishable-key>
```

Run the project setup:

```bash
pnpm setup
```

Start the development server:

```bash
pnpm dev
```

## Common Commands

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `pnpm setup`     | Prepare the development environment. |
| `pnpm dev`       | Start the Expo development server.   |
| `pnpm build`     | Build all workspace packages.        |
| `pnpm typecheck` | Run TypeScript type checking.        |

## Project Structure

```text
apps/
packages/
scripts/
supabase/
docs/
```

## Documentation

- `docs/setup.md` — Complete project setup guide.
- `docs/supabase.md` — Supabase workflow and database migrations.
- `docs/architecture.md` — Project architecture (coming soon).

## License

This project is licensed under the MIT License.
