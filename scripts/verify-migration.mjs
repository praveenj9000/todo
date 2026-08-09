import { execSync } from "node:child_process";

function run(command) {
  return execSync(command, { encoding: "utf-8" });
}

console.log("📦 Checking migration status against remote...\n");

let output;

try {
  output = run("pnpm dlx supabase migration list");
} catch (error) {
  console.error("✖ Failed to fetch migration list.");
  console.error(error.stdout?.toString() ?? error.message);
  process.exit(1);
}

console.log(output);

const rows = output
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.startsWith("`") || line.includes("|"))
  .filter((line) => !line.includes("Local") && !line.includes("---"));

const mismatches = [];

for (const row of rows) {
  const cells = row
    .split("|")
    .map((cell) => cell.trim().replace(/`/g, ""))
    .filter(Boolean);

  if (cells.length < 2) {
    continue;
  }

  const [local, remote] = cells;

  if (local && !remote) {
    mismatches.push(`Local-only (not yet applied remotely): ${local}`);
  } else if (remote && !local) {
    mismatches.push(`Remote-only (missing local file): ${remote}`);
  }
}

if (mismatches.length === 0) {
  console.log("✓ Local and remote migrations match.");
} else {
  console.log("⚠ Mismatches found:\n");
  mismatches.forEach((line) => console.log(`  - ${line}`));
  console.log(
    "\nRun `pnpm db:push` to apply pending local migrations, or investigate remote-only entries manually.",
  );
  process.exit(1);
}