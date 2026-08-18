import { execSync } from "node:child_process";

function run(command) {
  console.log(`\n▶ ${command}`);
  execSync(command, { stdio: "inherit" });
}

let failed = false;

try {
  run("node scripts/db-link.mjs e2e");
  run("pnpm dlx supabase db push");
  run("node scripts/verify-migration.mjs");
} catch {
  failed = true;
}

// Always relink back to prod, success or failure — leaving the CLI linked
// to the e2e project is the riskier default (a later `pnpm db:push` run
// without noticing could push to the wrong project).
run("node scripts/db-link.mjs prod");

if (failed) {
  console.error(
    "\n✖ A step failed while migrating the e2e project. Relinked back to " +
      "prod so you don't accidentally push there by mistake.\n" +
      "To investigate, run these four commands manually:\n" +
      "  pnpm db:link:e2e\n" +
      "  pnpm dlx supabase db push\n" +
      "  pnpm verify-migration\n" +
      "  pnpm db:link:prod",
  );
  process.exit(1);
}

console.log("\n✓ E2E project migrated and verified. Relinked to prod.");
