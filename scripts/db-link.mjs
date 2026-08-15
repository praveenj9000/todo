import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const target = process.argv[2];

if (target !== "prod" && target !== "e2e") {
  console.error("Usage: node scripts/db-link.mjs <prod|e2e>");
  process.exit(1);
}

const envFile =
  target === "prod" ? resolve(".env") : resolve(".env.e2e");

const varName = target === "prod" ? "PROD_PROJECT_REF" : "E2E_PROJECT_REF";

if (!existsSync(envFile)) {
  console.error(`✖ ${envFile} not found.`);
  process.exit(1);
}

const contents = readFileSync(envFile, "utf-8");
const match = contents.match(new RegExp(`^${varName}=(.*)$`, "m"));

if (!match || !match[1].trim()) {
  console.error(`✖ ${varName} is missing or empty in ${envFile}.`);
  process.exit(1);
}

const ref = match[1].trim();

console.log(`Linking to ${target} project (${ref})...`);

execSync(`pnpm dlx supabase link --project-ref ${ref}`, {
  stdio: "inherit",
});