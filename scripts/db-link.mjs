import { execSync } from "node:child_process";
import { ensureDbPassword, getProjectRef } from "./lib/db-auth.mjs";

const target = process.argv[2];

if (target !== "prod" && target !== "e2e") {
  console.error("Usage: node scripts/db-link.mjs <prod|e2e>");
  process.exit(1);
}

const ref = getProjectRef(target);

await ensureDbPassword(target);

console.log(`Linking to ${target} project (${ref})...`);

try {
  execSync(`pnpm dlx supabase link --project-ref ${ref}`, {
    stdio: "inherit",
    timeout: 30_000,
  });
} catch (error) {
  if (error.signal === "SIGTERM" || error.code === "ETIMEDOUT") {
    console.error(
      "\n✖ `supabase link` didn't respond within 30s — likely IPv6-only " +
        "connectivity to the direct DB host on this network.\n",
    );
  }
  process.exit(1);
}