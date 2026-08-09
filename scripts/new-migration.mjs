import { execSync } from "node:child_process";

const rawName = process.argv[2];

if (!rawName) {
  console.error("Usage: pnpm db:new <migration_name>");
  process.exit(1);
}

const name = rawName.replace(/\.sql$/i, "");

if (name !== rawName) {
  console.log(`⚠ Stripped ".sql" from name — using "${name}"`);
}

if (!/^[a-z0-9_]+$/i.test(name)) {
  console.error(`✖ Invalid migration name "${name}". Use only letters, numbers, and underscores.`);
  process.exit(1);
}

try {
  execSync(`pnpm dlx supabase migration new ${name}`, {
    stdio: "inherit",
  });
} catch {
  console.error("✖ Failed to create migration.");
  process.exit(1);
}
