/**
 * Dumps the full content of all files modified in a given git commit into a single text file.
 *
 * Usage:
 *   Default (HEAD / latest commit):
 *     node scripts/dump-commit-files.mjs
 *     pnpm dump:commit
 *
 *   Specific Commit:
 *     node scripts/dump-commit-files.mjs <commit_hash>
 *     pnpm dump:commit <commit_hash>
 *
 * Example:
 *   pnpm dump:commit a1b2c3d
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

// Get commit hash from arguments (defaults to HEAD if not provided)
const commitHash = process.argv[2] || "HEAD";
const OUTPUT_FILE = "commit_changed_files.txt";

try {
  // Get changed files from the specified commit hash
  const diffOutput = execSync(`git show --name-only --pretty="" ${commitHash}`, {
    encoding: "utf8",
  });

  const files = diffOutput
    .split("\n")
    .map((line) => line.trim())
    .filter((file) => file.length > 0 && file !== OUTPUT_FILE && existsSync(file));

  if (files.length === 0) {
    console.log(`No changed files found for commit: ${commitHash}`);
    process.exit(0);
  }

  let content = "";

  for (const file of files) {
    content += `========================================\n`;
    content += `FILE: ${file}\n`;
    content += `========================================\n`;
    content += readFileSync(file, "utf8");
    content += `\n\n`;
  }

  writeFileSync(OUTPUT_FILE, content, "utf8");
  console.log(
    `Successfully exported ${files.length} file(s) from commit ${commitHash} to ${OUTPUT_FILE}`
  );
} catch (error) {
  console.error("Error generating dump:", error.message);
  process.exit(1);
}