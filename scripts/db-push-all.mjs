import { execFileSync, execSync } from "node:child_process";
import { buildDirectDbUrl, ensureDbPassword, redactDbUrl } from "./lib/db-auth.mjs";

function handleTimeout(error, timeoutMs, label) {
  if (timeoutMs && (error.signal === "SIGTERM" || error.code === "ETIMEDOUT")) {
    console.error(
      `\n✖ "${label}" didn't finish within ${timeoutMs / 1000}s.\n` +
        "If this is a genuine network issue (not the confirmation prompt, " +
        "now skipped via --yes): could be IPv6-only connectivity to the " +
        "direct DB host — try the pooler connection string from Project " +
        "Settings → Database → Connection string (Transaction mode, port " +
        "6543) instead.\n",
    );
  }
}

function run(command, { timeoutMs, label } = {}) {
  console.log(`\n▶ ${label ?? command}`);
  try {
    execSync(command, { stdio: "inherit", timeout: timeoutMs });
  } catch (error) {
    handleTimeout(error, timeoutMs, label ?? command);
    throw error;
  }
}

function runArgs(file, args, { timeoutMs, label } = {}) {
  const displayLabel = label ?? [file, ...args].join(" ");
  console.log(`\n▶ ${displayLabel}`);
  try {
    execFileSync(file, args, { stdio: "inherit", timeout: timeoutMs, shell: true });
  } catch (error) {
    handleTimeout(error, timeoutMs, displayLabel);
    throw error;
  }
}

async function pushProd() {
  console.log("\n=== Prod (remote) ===");

  const password = await ensureDbPassword("prod");
  const dbUrl = buildDirectDbUrl("prod", password);

  run("node scripts/db-link.mjs prod");
  runArgs("pnpm", ["dlx", "supabase", "db", "push", "--db-url", dbUrl, "--yes"], {
    timeoutMs: 90_000,
    label: `pnpm dlx supabase db push --db-url "${redactDbUrl(dbUrl)}" --yes`,
  });
  run("node scripts/verify-migration.mjs");
}

function pushE2eRemote() {
  console.log("\n=== E2E (remote) ===");
  run("node scripts/db-push-e2e.mjs"); // already links, pushes, verifies, relinks to prod
}

function migrateLocal() {
  console.log("\n=== Local Supabase (Docker) ===");

  try {
    execSync("pnpm dlx supabase status", { stdio: "ignore" });
  } catch {
    console.error("✖ Local Supabase isn't running. Run `pnpm test:e2e:local:setup` first.");
    process.exit(1);
  }

  run("pnpm dlx supabase migration up", { timeoutMs: 60_000 });
  console.log("✓ Local Docker Supabase is up to date.");
}

async function main() {
  console.log("🚀 Pushing migrations to all environments\n");

  await pushProd();

  delete process.env.SUPABASE_DB_PASSWORD;

  pushE2eRemote();
  migrateLocal();

  console.log("\n✨ Done. CLI is linked to prod.");
}

main();