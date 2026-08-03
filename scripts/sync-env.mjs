import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const rootEnv = resolve(".env");
const appEnv = resolve("apps/app/.env");

if (!existsSync(rootEnv)) {
  console.error("Root .env not found.");
  process.exit(1);
}

copyFileSync(rootEnv, appEnv);

console.log("✓ Synced .env -> apps/app/.env");