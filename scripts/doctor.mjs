import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

function section(title) {
  console.log(`\n📦 ${title}`);
}

function success(message) {
  console.log(`✓ ${message}`);
}

function warning(message) {
  console.log(`⚠ ${message}`);
}

function fail(message) {
  console.log(`✖ ${message}`);
}

let hasWarnings = false;
let hasFailures = false;

function checkNode() {
  section("Node.js");

  const version = process.version;
  const major = Number(version.slice(1).split(".")[0]);

  if (major >= 24) {
    success(version);
  } else {
    warning(`${version} — this project expects Node 24 or newer`);
    hasWarnings = true;
  }
}

function checkPnpm() {
  section("pnpm");

  try {
    const version = execSync("pnpm --version").toString().trim();
    success(version);
  } catch {
    fail("pnpm is not installed.");
    hasFailures = true;
  }
}

function checkEnv() {
  section("Environment");

  if (!existsSync(".env")) {
    fail("Root .env is missing. See docs/setup.md.");
    hasFailures = true;
    return;
  }

  const contents = readFileSync(".env", "utf-8");
  const required = ["EXPO_PUBLIC_SUPABASE_URL", "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];

  for (const key of required) {
    const match = contents.match(new RegExp(`^${key}=(.*)$`, "m"));

    if (!match || !match[1].trim()) {
      fail(`${key} is missing or empty in .env`);
      hasFailures = true;
    } else {
      success(`${key} is set`);
    }
  }

  if (!existsSync("apps/app/.env")) {
    warning("apps/app/.env not found — run `pnpm sync-env`");
    hasWarnings = true;
  }
}

function checkSupabaseCli() {
  section("Supabase CLI");

  try {
    execSync("pnpm dlx supabase --version", { stdio: "ignore" });
    success("Available");
  } catch {
    warning("Supabase CLI unavailable via pnpm dlx");
    hasWarnings = true;
  }
}

function checkExpoDependencies() {
  section("Expo dependency versions");

  try {
    execSync("pnpm --filter @todo/app exec expo install --check", {
      stdio: "pipe",
    });
    success("All dependencies match the installed Expo SDK");
  } catch (error) {
    warning("Some dependencies may not match the installed Expo SDK");
    console.log(error.stdout?.toString() ?? "");
    console.log("Fix with: pnpm --filter @todo/app add <package>@<expected-version>");
    hasWarnings = true;
  }
}

console.log("🩺 Todo Project Doctor\n");

checkNode();
checkPnpm();
checkEnv();
checkSupabaseCli();
checkExpoDependencies();

console.log("\n---");

if (hasFailures) {
  fail("Doctor found issues that must be fixed.");
  process.exit(1);
} else if (hasWarnings) {
  warning("Doctor found non-blocking issues — review above.");
} else {
  success("Everything looks good.");
}
