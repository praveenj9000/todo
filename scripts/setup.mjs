import { execSync } from "node:child_process";
import fs from "node:fs";

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

function run(command) {
  try {
    execSync(command, {
      stdio: "inherit",
    });
  } catch {
    fail(`Command failed: ${command}`);
    process.exit(1);
  }
}

function commandExists(command) {
  try {
    execSync(command, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function checkNode() {
  section("Node.js");
  success(process.version);
}

function checkPnpm() {
  section("pnpm");

  try {
    const version = execSync("pnpm --version")
      .toString()
      .trim();

    success(version);
  } catch {
    fail("pnpm is not installed.");
    process.exit(1);
  }
}

function installDependencies() {
  section("Dependencies");

  if (!fs.existsSync("node_modules")) {
    run("pnpm install");
  }

  success("Dependencies installed");
}

function syncEnvironment() {
  section("Environment");

  if (!fs.existsSync(".env")) {
    if (fs.existsSync(".env.example")) {
      fs.copyFileSync(".env.example", ".env");

      warning("Created .env from .env.example");
      warning("Please fill in your Supabase credentials.");
    } else {
      fail(".env and .env.example are missing.");
      process.exit(1);
    }
  }

  run("pnpm sync-env");

  success("Environment synced");
}

function checkSupabase() {
  section("Supabase");

  if (commandExists("pnpm dlx supabase --version")) {
    success("Supabase CLI available");
  } else {
    warning("Supabase CLI unavailable");
  }
}

function runTypecheck() {
  section("TypeScript");

  run("pnpm typecheck");

  success("TypeScript passed");
}

console.log("🚀 Todo Project Setup\n");

checkNode();
checkPnpm();
installDependencies();
syncEnvironment();
checkSupabase();
runTypecheck();

console.log("\n✨ Project is ready!");
console.log("\nRun:");
console.log("pnpm dev");