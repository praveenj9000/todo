import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_EMAIL = "e2e-local@todo-app.test";
const DEFAULT_PASSWORD = "e2e-local-password-123";

function section(title) {
  console.log(`\n📦 ${title}`);
}

function checkDocker() {
  section("Checking Docker");

  try {
    execSync("docker info", { stdio: "ignore" });
    console.log("✓ Docker is running");
  } catch {
    console.error("✖ Docker is not installed or not running.");
    console.error("");
    console.error("This step can't be automated — Docker Desktop requires a");
    console.error("manual install and first launch. See docs/setup.md's");
    console.error("'Local E2E Testing' section for install links and steps.");
    console.error("");
    console.error("Once Docker is running, re-run: pnpm test:e2e:local:setup");
    process.exit(1);
  }
}

function startSupabase() {
  section("Starting local Supabase stack");

  try {
    execSync("pnpm dlx supabase start", { stdio: "inherit" });
  } catch {
    console.error("✖ Failed to start the local Supabase stack.");
    console.error("If this is the first run, it may need to download Docker");
    console.error("images — check your network connection and try again.");
    process.exit(1);
  }
}

function getLocalStatus() {
  section("Reading local Supabase connection details");

  const output = execSync("pnpm dlx supabase status -o env", {
    encoding: "utf-8",
  });

  const values = {};

  for (const line of output.split("\n")) {
    const match = line.match(/^([A-Z_]+)="?(.*?)"?$/);

    if (match) {
      values[match[1]] = match[2];
    }
  }

  if (!values.API_URL || !values.ANON_KEY || !values.SERVICE_ROLE_KEY) {
    console.error("✖ Could not parse Supabase status output.");
    console.error("Raw output was:\n" + output);
    process.exit(1);
  }

  console.log(`✓ Local API URL: ${values.API_URL}`);

  return values;
}

async function ensureTestUser(apiUrl, serviceRoleKey) {
  section("Ensuring local test user exists");

  const { createClient } = await import("@supabase/supabase-js");

  const admin = createClient(apiUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existing } = await admin.auth.admin.listUsers();
  const found = existing?.users?.find((u) => u.email === DEFAULT_EMAIL);

  if (found) {
    const { error } = await admin.auth.admin.updateUserById(found.id, {
      password: DEFAULT_PASSWORD,
    });

    if (error) {
      console.error(`✖ Failed to update existing test user: ${error.message}`);
      process.exit(1);
    }

    console.log(`✓ Test user already existed — password confirmed/reset`);
    return;
  }

  const { error } = await admin.auth.admin.createUser({
    email: DEFAULT_EMAIL,
    password: DEFAULT_PASSWORD,
    email_confirm: true,
  });

  if (error) {
    console.error(`✖ Failed to create test user: ${error.message}`);
    process.exit(1);
  }

  console.log(`✓ Created test user ${DEFAULT_EMAIL}`);
}

function writeEnvFile(values) {
  section("Writing .env.e2e.local");

  const path = resolve(".env.e2e.local");

  const contents = [
    `EXPO_PUBLIC_SUPABASE_URL=${values.API_URL}`,
    `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${values.ANON_KEY}`,
    `E2E_TEST_USER_EMAIL=${DEFAULT_EMAIL}`,
    `E2E_TEST_USER_PASSWORD=${DEFAULT_PASSWORD}`,
    "",
  ].join("\n");

  writeFileSync(path, contents);

  console.log(`✓ Wrote ${path}`);
}

async function main() {
  console.log("🐳 Local E2E Environment Setup\n");

  checkDocker();
  startSupabase();

  const status = getLocalStatus();
  await ensureTestUser(status.API_URL, status.SERVICE_ROLE_KEY);
  writeEnvFile(status);

  console.log("\n✨ Local E2E environment is ready.");
  console.log("\nRun:");
  console.log("pnpm test:e2e:local");
}

main();
