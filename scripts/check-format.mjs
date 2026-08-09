import { execSync } from "node:child_process";

const staged = execSync("git diff --cached --name-only --diff-filter=ACM", {
  encoding: "utf-8",
})
  .split("\n")
  .filter(Boolean)
  .filter((file) => /\.(ts|tsx|js|jsx|json|md)$/.test(file))
  .filter((file) => !file.includes("database.ts"));

if (staged.length === 0) {
  process.exit(0);
}

try {
  execSync(`pnpm exec prettier --check ${staged.map((f) => `"${f}"`).join(" ")}`, {
    stdio: "inherit",
  });
} catch {
  console.error("\n✖ Some staged files are not formatted. Run `pnpm format` and re-stage.");
  process.exit(1);
}
